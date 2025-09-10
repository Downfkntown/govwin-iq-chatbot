#!/bin/bash

# ======================================================================
# GovWin IQ Chatbot - Staging Deployment Script
# ======================================================================
# Automated deployment script with health checks and rollback capabilities
# Features:
# - Pre-deployment validation and dependency checks
# - Automated backup creation and management
# - Progressive deployment with health monitoring
# - Automatic rollback on failure detection
# - Comprehensive logging and notification support
# ======================================================================

set -euo pipefail  # Exit on error, undefined variables, and pipe failures

# Script configuration
readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
readonly DEPLOYMENT_LOG="${SCRIPT_DIR}/logs/staging-deploy-$(date +%Y%m%d-%H%M%S).log"
readonly BACKUP_DIR="${SCRIPT_DIR}/backups"
readonly CONFIG_FILE="${SCRIPT_DIR}/staging-config.js"

# Environment variables with defaults
readonly STAGING_PORT="${STAGING_PORT:-3002}"
readonly STAGING_HOST="${STAGING_HOST:-localhost}"
readonly HEALTH_CHECK_TIMEOUT="${HEALTH_CHECK_TIMEOUT:-60}"
readonly ROLLBACK_TIMEOUT="${ROLLBACK_TIMEOUT:-30}"
readonly MAX_DEPLOYMENT_TIME="${MAX_DEPLOYMENT_TIME:-300}"

# Colors for output
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly PURPLE='\033[0;35m'
readonly CYAN='\033[0;36m'
readonly NC='\033[0m' # No Color

# Global variables
DEPLOYMENT_ID=""
BACKUP_CREATED=false
OLD_PID=""
NEW_PID=""
ROLLBACK_REQUIRED=false
START_TIME=""

# ======================================================================
# Utility Functions
# ======================================================================

log() {
    local level="$1"
    shift
    local message="$*"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    # Create log directory if it doesn't exist
    mkdir -p "$(dirname "$DEPLOYMENT_LOG")"
    
    # Log to file
    echo "[$timestamp] [$level] $message" >> "$DEPLOYMENT_LOG"
    
    # Log to console with colors
    case "$level" in
        "INFO")  echo -e "${BLUE}[INFO]${NC} $message" ;;
        "WARN")  echo -e "${YELLOW}[WARN]${NC} $message" ;;
        "ERROR") echo -e "${RED}[ERROR]${NC} $message" ;;
        "SUCCESS") echo -e "${GREEN}[SUCCESS]${NC} $message" ;;
        "DEBUG") echo -e "${PURPLE}[DEBUG]${NC} $message" ;;
        *) echo "[$level] $message" ;;
    esac
}

banner() {
    local message="$1"
    local char="${2:-=}"
    local width=70
    
    echo
    printf "${CYAN}%*s${NC}\n" $width | tr ' ' "$char"
    printf "${CYAN}%s${NC}\n" "$message"
    printf "${CYAN}%*s${NC}\n" $width | tr ' ' "$char"
    echo
}

cleanup() {
    log "INFO" "Starting cleanup process..."
    
    # Kill any hanging processes if deployment failed
    if [[ "$ROLLBACK_REQUIRED" == true && -n "$NEW_PID" ]]; then
        log "WARN" "Killing new process (PID: $NEW_PID) due to failed deployment"
        kill -TERM "$NEW_PID" 2>/dev/null || true
        sleep 5
        kill -KILL "$NEW_PID" 2>/dev/null || true
    fi
    
    # Clean up temporary files
    find "${SCRIPT_DIR}" -name "*.tmp" -type f -mtime +1 -delete 2>/dev/null || true
    
    log "INFO" "Cleanup completed"
}

# Set up trap for cleanup
trap cleanup EXIT

# ======================================================================
# Validation Functions
# ======================================================================

validate_environment() {
    banner "Environment Validation"
    
    log "INFO" "Validating deployment environment..."
    
    # Check if we're in the correct directory
    if [[ ! -f "$PROJECT_ROOT/package.json" ]]; then
        log "ERROR" "Not in project root directory. Expected to find package.json"
        exit 1
    fi
    
    # Check Node.js version
    if ! command -v node >/dev/null 2>&1; then
        log "ERROR" "Node.js is not installed"
        exit 1
    fi
    
    local node_version=$(node -v | cut -d'v' -f2)
    log "INFO" "Node.js version: $node_version"
    
    # Check npm
    if ! command -v npm >/dev/null 2>&1; then
        log "ERROR" "npm is not installed"
        exit 1
    fi
    
    # Check staging configuration
    if [[ ! -f "$CONFIG_FILE" ]]; then
        log "ERROR" "Staging configuration file not found: $CONFIG_FILE"
        exit 1
    fi
    
    # Validate configuration syntax
    if ! node -c "$CONFIG_FILE" >/dev/null 2>&1; then
        log "ERROR" "Staging configuration has syntax errors"
        exit 1
    fi
    
    # Check required directories
    local required_dirs=(
        "$PROJECT_ROOT/agents"
        "$PROJECT_ROOT/rag"
        "$PROJECT_ROOT/server"
        "$PROJECT_ROOT/knowledge-base"
    )
    
    for dir in "${required_dirs[@]}"; do
        if [[ ! -d "$dir" ]]; then
            log "ERROR" "Required directory missing: $dir"
            exit 1
        fi
    done
    
    # Check disk space (require at least 1GB free)
    local available_space=$(df "$PROJECT_ROOT" | awk 'NR==2{print $4}')
    if [[ "$available_space" -lt 1048576 ]]; then  # 1GB in KB
        log "WARN" "Low disk space detected. Available: ${available_space}KB"
    fi
    
    log "SUCCESS" "Environment validation completed"
}

validate_dependencies() {
    banner "Dependency Validation"
    
    log "INFO" "Checking project dependencies..."
    
    # Check if node_modules exists
    if [[ ! -d "$PROJECT_ROOT/node_modules" ]]; then
        log "WARN" "node_modules not found. Installing dependencies..."
        cd "$PROJECT_ROOT"
        npm install
    fi
    
    # Validate key dependencies
    local key_deps=("express" "cors")
    for dep in "${key_deps[@]}"; do
        if [[ ! -d "$PROJECT_ROOT/node_modules/$dep" ]]; then
            log "ERROR" "Critical dependency missing: $dep"
            exit 1
        fi
    done
    
    # Run security audit
    log "INFO" "Running security audit..."
    cd "$PROJECT_ROOT"
    if ! npm audit --audit-level moderate >/dev/null 2>&1; then
        log "WARN" "Security vulnerabilities detected. Consider running 'npm audit fix'"
    fi
    
    log "SUCCESS" "Dependencies validated"
}

# ======================================================================
# Backup Functions
# ======================================================================

create_backup() {
    banner "Creating Backup"
    
    DEPLOYMENT_ID="staging-$(date +%Y%m%d-%H%M%S)"
    local backup_path="$BACKUP_DIR/$DEPLOYMENT_ID"
    
    log "INFO" "Creating backup: $DEPLOYMENT_ID"
    
    # Create backup directory
    mkdir -p "$backup_path"
    
    # Backup current application files
    log "INFO" "Backing up application files..."
    rsync -av --exclude='node_modules' --exclude='logs' --exclude='.git' \
          "$PROJECT_ROOT/" "$backup_path/app/" >/dev/null 2>&1
    
    # Backup data files
    if [[ -d "$PROJECT_ROOT/data" ]]; then
        log "INFO" "Backing up data files..."
        cp -r "$PROJECT_ROOT/data" "$backup_path/" 2>/dev/null || true
    fi
    
    # Backup configuration
    if [[ -f "$PROJECT_ROOT/rag/govwin-faq-vectors.json" ]]; then
        log "INFO" "Backing up vector database..."
        cp "$PROJECT_ROOT/rag/govwin-faq-vectors.json" "$backup_path/" 2>/dev/null || true
    fi
    
    # Create backup manifest
    cat > "$backup_path/manifest.json" << EOF
{
    "deployment_id": "$DEPLOYMENT_ID",
    "timestamp": "$(date -Iseconds)",
    "git_commit": "$(cd "$PROJECT_ROOT" && git rev-parse HEAD 2>/dev/null || echo 'unknown')",
    "git_branch": "$(cd "$PROJECT_ROOT" && git branch --show-current 2>/dev/null || echo 'unknown')",
    "node_version": "$(node -v)",
    "backup_size": "$(du -sh "$backup_path" | cut -f1)"
}
EOF
    
    BACKUP_CREATED=true
    log "SUCCESS" "Backup created successfully: $backup_path"
    
    # Clean up old backups (keep last 10)
    log "INFO" "Cleaning up old backups..."
    find "$BACKUP_DIR" -maxdepth 1 -name "staging-*" -type d | \
        sort -r | tail -n +11 | xargs rm -rf 2>/dev/null || true
}

# ======================================================================
# Health Check Functions
# ======================================================================

check_port_available() {
    local port="$1"
    if netstat -tuln 2>/dev/null | grep -q ":$port "; then
        return 1  # Port is in use
    fi
    return 0  # Port is available
}

get_process_using_port() {
    local port="$1"
    local pid=$(netstat -tulnp 2>/dev/null | grep ":$port " | awk '{print $7}' | cut -d'/' -f1 | head -n1)
    echo "$pid"
}

wait_for_service() {
    local url="$1"
    local timeout="$2"
    local start_time=$(date +%s)
    
    log "INFO" "Waiting for service to be available at $url..."
    
    while true; do
        local current_time=$(date +%s)
        local elapsed=$((current_time - start_time))
        
        if [[ $elapsed -ge $timeout ]]; then
            log "ERROR" "Service did not become available within ${timeout}s"
            return 1
        fi
        
        if curl -s -f "$url" >/dev/null 2>&1; then
            log "SUCCESS" "Service is available (${elapsed}s)"
            return 0
        fi
        
        log "DEBUG" "Waiting for service... (${elapsed}s/${timeout}s)"
        sleep 2
    done
}

perform_health_checks() {
    local base_url="http://$STAGING_HOST:$STAGING_PORT"
    
    banner "Health Checks"
    
    log "INFO" "Performing comprehensive health checks..."
    
    # Basic connectivity check
    if ! wait_for_service "$base_url/api/v1/system/health" "$HEALTH_CHECK_TIMEOUT"; then
        log "ERROR" "Health check endpoint not responding"
        return 1
    fi
    
    # Test API endpoints
    local endpoints=(
        "/api/v1/system/health"
        "/api/v1/system/stats"
        "/api/v1/agents/registry"
    )
    
    for endpoint in "${endpoints[@]}"; do
        local url="$base_url$endpoint"
        log "INFO" "Testing endpoint: $endpoint"
        
        local response=$(curl -s -w "%{http_code}" "$url" -o /dev/null)
        if [[ "$response" != "200" ]]; then
            log "ERROR" "Endpoint $endpoint returned HTTP $response"
            return 1
        fi
        log "SUCCESS" "Endpoint $endpoint: OK"
    done
    
    # Test agent system
    log "INFO" "Testing agent coordination system..."
    local test_query='{"message": "test deployment health check", "sessionId": "deployment-test"}'
    local response=$(curl -s -X POST "$base_url/api/v1/chat/message" \
                          -H "Content-Type: application/json" \
                          -d "$test_query" -w "%{http_code}" -o /dev/null)
    
    if [[ "$response" != "200" ]]; then
        log "ERROR" "Agent system test failed with HTTP $response"
        return 1
    fi
    
    # Memory usage check
    local memory_usage=$(ps -o pid,vsz,rss,comm -p "$NEW_PID" | tail -n1 | awk '{print $3}')
    if [[ "$memory_usage" -gt 1048576 ]]; then  # 1GB in KB
        log "WARN" "High memory usage detected: ${memory_usage}KB"
    fi
    
    log "SUCCESS" "All health checks passed"
    return 0
}

# ======================================================================
# Deployment Functions
# ======================================================================

stop_current_service() {
    banner "Stopping Current Service"
    
    # Find current process
    OLD_PID=$(get_process_using_port "$STAGING_PORT")
    
    if [[ -z "$OLD_PID" ]]; then
        log "INFO" "No existing service found on port $STAGING_PORT"
        return 0
    fi
    
    log "INFO" "Stopping existing service (PID: $OLD_PID)..."
    
    # Graceful shutdown
    kill -TERM "$OLD_PID" 2>/dev/null || true
    
    # Wait for graceful shutdown
    local timeout=15
    local count=0
    while kill -0 "$OLD_PID" 2>/dev/null && [[ $count -lt $timeout ]]; do
        sleep 1
        ((count++))
        log "DEBUG" "Waiting for graceful shutdown... (${count}s/${timeout}s)"
    done
    
    # Force kill if still running
    if kill -0 "$OLD_PID" 2>/dev/null; then
        log "WARN" "Forcing service shutdown..."
        kill -KILL "$OLD_PID" 2>/dev/null || true
        sleep 2
    fi
    
    # Verify port is free
    if ! check_port_available "$STAGING_PORT"; then
        log "ERROR" "Port $STAGING_PORT is still in use after service shutdown"
        exit 1
    fi
    
    log "SUCCESS" "Service stopped successfully"
}

deploy_new_version() {
    banner "Deploying New Version"
    
    log "INFO" "Starting new service deployment..."
    
    # Set up environment
    cd "$PROJECT_ROOT"
    export NODE_ENV=staging
    export STAGING_PORT="$STAGING_PORT"
    export STAGING_HOST="$STAGING_HOST"
    
    # Start new service in background
    log "INFO" "Starting new service on port $STAGING_PORT..."
    nohup node -r "$CONFIG_FILE" server/simple-server.js > "${SCRIPT_DIR}/logs/staging-service.log" 2>&1 &
    NEW_PID=$!
    
    # Wait for process to stabilize
    sleep 5
    
    # Verify process is still running
    if ! kill -0 "$NEW_PID" 2>/dev/null; then
        log "ERROR" "New service process died immediately"
        cat "${SCRIPT_DIR}/logs/staging-service.log" | tail -20
        return 1
    fi
    
    log "SUCCESS" "New service started (PID: $NEW_PID)"
    
    # Wait for service to be ready
    local ready_timeout=30
    local count=0
    while [[ $count -lt $ready_timeout ]]; do
        if check_port_available "$STAGING_PORT"; then
            sleep 1
            ((count++))
            log "DEBUG" "Waiting for service to bind to port... (${count}s/${ready_timeout}s)"
        else
            log "SUCCESS" "Service bound to port $STAGING_PORT"
            break
        fi
    done
    
    if check_port_available "$STAGING_PORT"; then
        log "ERROR" "Service failed to bind to port within ${ready_timeout}s"
        return 1
    fi
    
    return 0
}

# ======================================================================
# Rollback Functions
# ======================================================================

perform_rollback() {
    banner "Performing Rollback"
    
    ROLLBACK_REQUIRED=true
    log "WARN" "Initiating rollback procedure..."
    
    # Kill new process
    if [[ -n "$NEW_PID" ]]; then
        log "INFO" "Stopping failed deployment (PID: $NEW_PID)..."
        kill -TERM "$NEW_PID" 2>/dev/null || true
        sleep 5
        kill -KILL "$NEW_PID" 2>/dev/null || true
    fi
    
    # Restore from backup if available
    if [[ "$BACKUP_CREATED" == true ]]; then
        local backup_path="$BACKUP_DIR/$DEPLOYMENT_ID"
        log "INFO" "Restoring from backup: $DEPLOYMENT_ID"
        
        # Restore application files
        rsync -av "$backup_path/app/" "$PROJECT_ROOT/" >/dev/null 2>&1
        
        # Restore data files
        if [[ -f "$backup_path/govwin-faq-vectors.json" ]]; then
            cp "$backup_path/govwin-faq-vectors.json" "$PROJECT_ROOT/rag/" 2>/dev/null || true
        fi
    fi
    
    # Restart old service if we had one
    if [[ -n "$OLD_PID" ]]; then
        log "INFO" "Attempting to restart previous service..."
        cd "$PROJECT_ROOT"
        nohup node server/simple-server.js > "${SCRIPT_DIR}/logs/rollback-service.log" 2>&1 &
        local rollback_pid=$!
        
        # Wait for rollback service
        if wait_for_service "http://$STAGING_HOST:3001/api/v1/system/health" "$ROLLBACK_TIMEOUT"; then
            log "SUCCESS" "Rollback completed successfully (PID: $rollback_pid)"
        else
            log "ERROR" "Rollback failed - manual intervention required"
            exit 1
        fi
    else
        log "WARN" "No previous service to restore"
    fi
}

# ======================================================================
# Notification Functions
# ======================================================================

send_notification() {
    local status="$1"
    local message="$2"
    
    # Log notification
    log "INFO" "Sending notification: $status - $message"
    
    # Send webhook notification if configured
    if [[ -n "${STAGING_WEBHOOK_URL:-}" ]]; then
        local payload=$(cat << EOF
{
    "deployment_id": "$DEPLOYMENT_ID",
    "status": "$status",
    "message": "$message",
    "timestamp": "$(date -Iseconds)",
    "environment": "staging",
    "host": "$(hostname)",
    "port": "$STAGING_PORT"
}
EOF
)
        curl -s -X POST "$STAGING_WEBHOOK_URL" \
             -H "Content-Type: application/json" \
             -d "$payload" >/dev/null 2>&1 || true
    fi
    
    # Send email notification if configured
    if [[ -n "${STAGING_ALERT_EMAILS:-}" ]]; then
        echo "$message" | mail -s "Staging Deployment: $status" "$STAGING_ALERT_EMAILS" 2>/dev/null || true
    fi
}

# ======================================================================
# Main Deployment Function
# ======================================================================

main() {
    START_TIME=$(date +%s)
    
    banner "GovWin IQ Chatbot - Staging Deployment"
    
    log "INFO" "Starting deployment process..."
    log "INFO" "Deployment ID: $DEPLOYMENT_ID"
    log "INFO" "Target: $STAGING_HOST:$STAGING_PORT"
    log "INFO" "Log file: $DEPLOYMENT_LOG"
    
    # Pre-deployment validation
    validate_environment
    validate_dependencies
    
    # Create backup
    create_backup
    
    # Deploy new version
    stop_current_service
    
    if ! deploy_new_version; then
        log "ERROR" "Deployment failed during service startup"
        perform_rollback
        send_notification "FAILED" "Deployment failed during service startup"
        exit 1
    fi
    
    # Health checks
    if ! perform_health_checks; then
        log "ERROR" "Deployment failed health checks"
        perform_rollback
        send_notification "FAILED" "Deployment failed health checks"
        exit 1
    fi
    
    # Success!
    local end_time=$(date +%s)
    local total_time=$((end_time - START_TIME))
    
    banner "Deployment Successful"
    
    log "SUCCESS" "Deployment completed successfully!"
    log "SUCCESS" "Service running on: http://$STAGING_HOST:$STAGING_PORT"
    log "SUCCESS" "Process ID: $NEW_PID"
    log "SUCCESS" "Total deployment time: ${total_time}s"
    log "SUCCESS" "Backup created: $DEPLOYMENT_ID"
    
    # Display service information
    echo
    echo -e "${GREEN}Service Information:${NC}"
    echo -e "  URL: ${CYAN}http://$STAGING_HOST:$STAGING_PORT${NC}"
    echo -e "  Health Check: ${CYAN}http://$STAGING_HOST:$STAGING_PORT/api/v1/system/health${NC}"
    echo -e "  System Stats: ${CYAN}http://$STAGING_HOST:$STAGING_PORT/api/v1/system/stats${NC}"
    echo -e "  Process ID: ${CYAN}$NEW_PID${NC}"
    echo -e "  Log File: ${CYAN}$DEPLOYMENT_LOG${NC}"
    echo
    
    send_notification "SUCCESS" "Deployment completed successfully in ${total_time}s"
}

# ======================================================================
# Script Entry Point
# ======================================================================

# Check if script is being sourced or executed
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --port)
                STAGING_PORT="$2"
                shift 2
                ;;
            --host)
                STAGING_HOST="$2"
                shift 2
                ;;
            --help)
                echo "Usage: $0 [--port PORT] [--host HOST] [--help]"
                echo "  --port PORT    Staging server port (default: 3002)"
                echo "  --host HOST    Staging server host (default: localhost)"
                echo "  --help         Show this help message"
                exit 0
                ;;
            *)
                log "ERROR" "Unknown argument: $1"
                exit 1
                ;;
        esac
    done
    
    # Run main deployment
    main "$@"
fi
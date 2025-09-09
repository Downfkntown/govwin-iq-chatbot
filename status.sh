#!/bin/bash

# GovWin IQ Chatbot - Project Status Command
# Shows current project state without exploration

echo "=== GovWin IQ Chatbot Project Status ==="
echo "Date: $(date)"
echo "Project Directory: $(pwd)"
echo ""

# Check if we're in the right directory
if [[ ! -f "CLAUDE.md" ]]; then
    echo "⚠️  Not in govwin-iq-chatbot project directory"
    exit 1
fi

echo "📁 Directory Structure:"
echo "├── config/                     $(ls -1 config/ 2>/dev/null | wc -l) files"
echo "├── conversation-flows/         $(ls -1 conversation-flows/ 2>/dev/null | wc -l) files"
echo "├── documentation/              $(ls -1 documentation/ 2>/dev/null | wc -l) files"
echo "├── knowledge-base/             $(ls -1 knowledge-base/ 2>/dev/null | wc -l) files"
echo "└── testing/                    $(ls -1 testing/ 2>/dev/null | wc -l) files"
echo ""

# Git status
if [[ -d ".git" ]]; then
    echo "📋 Git Status:"
    git status --porcelain | head -10
    if [[ $(git status --porcelain | wc -l) -gt 10 ]]; then
        echo "... and $(($(git status --porcelain | wc -l) - 10)) more files"
    fi
    echo ""
fi

# Recent activity
echo "📈 Recent Activity:"
if [[ -d ".git" ]]; then
    git log --oneline -5 2>/dev/null || echo "No commits yet"
else
    echo "No git repository"
fi
echo ""

# Project completeness
echo "✅ Project Completeness:"
total_dirs=5
populated_dirs=0

for dir in config conversation-flows documentation knowledge-base testing; do
    if [[ $(ls -1 "$dir" 2>/dev/null | wc -l) -gt 0 ]]; then
        populated_dirs=$((populated_dirs + 1))
        echo "[$dir] ✓ Has content"
    else
        echo "[$dir] ○ Empty"
    fi
done

completion_percent=$((populated_dirs * 100 / total_dirs))
echo ""
echo "Overall Progress: $completion_percent% ($populated_dirs/$total_dirs directories populated)"
echo ""

# Next suggested actions
echo "🎯 Next Actions:"
if [[ $populated_dirs -eq 0 ]]; then
    echo "• Start with knowledge-base/govwin-iq-knowledge-base.md"
    echo "• Define basic conversation flows"
    echo "• Set up initial configuration"
elif [[ $populated_dirs -lt 3 ]]; then
    echo "• Continue populating core directories"
    echo "• Add documentation for completed sections"
    echo "• Create test scenarios"
else
    echo "• Review and refine existing content"
    echo "• Test conversation flows"
    echo "• Prepare for deployment"
fi

echo ""
echo "Run './status.sh' anytime to see current project state"
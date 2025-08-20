#!/bin/bash
cd /home/kavia/workspace/code-generation/health-and-fitness-tracker-161404/fittrack_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi


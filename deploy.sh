#!/bin/zsh
# Build the landing (build.py) and the study site (build_site.py) into site/, sync into the Vercel-linked folder, deploy to production.
set -e
cd "$(dirname "$0")"
python3 build_site.py
rsync -a --delete --exclude '.vercel' site/ visuallearning-concept/
export PATH="/Users/rajat/.local/bin:$PATH"
cd visuallearning-concept && /Users/rajat/.local/bin/vercel deploy --prod --yes

# 🚨 Security Cleanup Guide for PharmJam

## ⚠️ URGENT: Your repository contains exposed credentials!

### **Step 1: Immediate Actions (Do this NOW)**

1. **Regenerate Supabase API Keys:**
   - Go to https://supabase.com/dashboard/project/jehukdivfpoxcmmzrrbz/settings/api
   - Click "Reset" on both anon and service keys
   - **DO NOT use the old keys anymore**

2. **Change any email passwords** that were exposed

### **Step 2: Remove Sensitive Data from Git History**

**Option A: Remove specific commits (Recommended)**
```bash
# 1. Create a backup branch first
git branch backup-before-cleanup

# 2. Remove the last few commits that contain sensitive data
git reset --hard HEAD~3  # Adjust number based on how many commits to remove

# 3. Force push to overwrite remote history
git push --force-with-lease origin master
```

**Option B: Remove specific files from history (More complex)**
```bash
# Install git-filter-repo (if not installed)
pip install git-filter-repo

# Remove specific files from entire history
git filter-repo --path lib/supabase.ts --invert-paths
git filter-repo --path-regex ".*\.(env|secret|credential).*" --invert-paths

# Force push
git push --force-with-lease origin master
```

**Option C: Nuclear option - Fresh start**
```bash
# 1. Delete .git folder to remove all history
rm -rf .git

# 2. Initialize new repository
git init
git add .
git commit -m "Initial commit - cleaned of sensitive data"

# 3. Add remote and push
git remote add origin https://github.com/Ajoe62/Pharmjam.git
git branch -M master
git push -u --force origin master
```

### **Step 3: Set Up Environment Variables**

1. **Create your .env file:**
```bash
# Copy the example and fill in your NEW credentials
cp .env.example .env
```

2. **Fill in your .env file with NEW credentials:**
```env
EXPO_PUBLIC_SUPABASE_URL=https://your-new-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_new_anon_key_here
```

### **Step 4: Verify Security**

1. **Check what's being tracked:**
```bash
git status
git ls-files | grep -E "\.(env|secret|credential|key)"
```

2. **Verify .env is ignored:**
```bash
git check-ignore .env
# Should return ".env" if properly ignored
```

3. **Test your app still works:**
```bash
npm start
```

### **Step 5: Prevent Future Issues**

1. **Add pre-commit hooks** (optional but recommended):
```bash
npm install --save-dev @commitlint/cli @commitlint/config-conventional
```

2. **Review before every commit:**
```bash
git diff --cached  # Review staged changes before committing
```

### **Files You've Already Secured:**
- ✅ Updated `.gitignore` to ignore sensitive files
- ✅ Created `.env.example` template
- ✅ Modified `lib/supabase.ts` to use environment variables

### **⚠️ REMEMBER:**
- **NEVER** commit files containing API keys, passwords, or tokens
- **ALWAYS** use environment variables for sensitive data
- **DOUBLE-CHECK** your commits before pushing
- **REGENERATE** any exposed credentials immediately

### **Next Steps:**
1. Choose cleanup option (A, B, or C above)
2. Update your Supabase credentials
3. Test your app
4. Create new, clean commits
5. Push to GitHub safely

---

**Need help?** Check Git documentation for `git reset`, `git filter-repo`, or `git rebase` for more advanced cleanup options.

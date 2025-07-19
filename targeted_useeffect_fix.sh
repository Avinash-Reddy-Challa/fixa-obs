#!/bin/bash

echo "🔍 Looking for alternative patterns that can cause 'destroy is not a function'"
echo "============================================================================="

echo "1. Check CustomOrganizationSwitcher.tsx content:"
if [ -f "apps/web-app/src/components/CustomOrganizationSwitcher.tsx" ]; then
    echo "File content:"
    cat apps/web-app/src/components/CustomOrganizationSwitcher.tsx
    echo -e "\n---"
else
    echo "File not found!"
fi

echo -e "\n2. Check for useMutation patterns that return Promises:"
grep -r -n -A 3 -B 1 "useMutation\|useQuery.*onSuccess\|useQuery.*onError" apps/web-app/src/ --include="*.tsx" --include="*.ts" | head -20

echo -e "\n3. Check for event handlers that might return Promises:"
grep -r -n -A 3 -B 1 "onClick.*=\|onSubmit.*=\|onChange.*=" apps/web-app/src/components/CustomOrganizationSwitcher.tsx apps/web-app/src/components/observe/ObserveSidebar.tsx 2>/dev/null

echo -e "\n4. Check for tRPC patterns that might be problematic:"
grep -r -n -A 3 -B 1 "\.invalidate\|\.refetch\|\.mutate" apps/web-app/src/components/CustomOrganizationSwitcher.tsx apps/web-app/src/components/observe/ObserveSidebar.tsx 2>/dev/null

echo -e "\n5. Look for incomplete useEffect in ObserveSidebar (line 109 area):"
sed -n '109,130p' apps/web-app/src/components/observe/ObserveSidebar.tsx

echo -e "\n6. Check for any component that might be wrapping CustomOrganizationSwitcher:"
grep -r -n "CustomOrganizationSwitcher" apps/web-app/src/ --include="*.tsx" --include="*.ts"

echo -e "\n7. Check for any async patterns in CustomOrganizationSwitcher imports or usage:"
grep -r -n -A 5 -B 5 "Organization\|Clerk" apps/web-app/src/components/CustomOrganizationSwitcher.tsx 2>/dev/null
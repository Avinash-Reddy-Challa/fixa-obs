// src/components/ClerkWrapper.tsx
"use client";

import React, { useState, useEffect } from 'react';

// This is a protective wrapper to prevent cleanup issues with Clerk components
export function ClerkWrapper({ children }: { children: React.ReactNode }) {
    const [mounted, setMounted] = useState(false);

    // Use a controlled mounting strategy
    useEffect(() => {
        setMounted(true);
        return () => {
            setMounted(false);
        };
    }, []);

    if (!mounted) {
        return null; // Don't render until after first mount
    }

    return <>{children}</>;
}
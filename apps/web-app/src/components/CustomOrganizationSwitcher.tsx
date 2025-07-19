"use client";

import React from 'react';
import { OrganizationSwitcher } from "@clerk/nextjs";
import { CreditCardIcon } from "@heroicons/react/24/solid";
import { BillingPage } from "~/components/BillingPage";

export function CustomOrganizationSwitcher() {
  // Replace the PostHog feature flag with a simpler approach
  const bypassPayment = false; // Set this to true or false based on your needs

  return (
    <OrganizationSwitcher
      hidePersonal
      hideSlug
      afterCreateOrganizationUrl={
        typeof window !== "undefined" ? window.location.href : "/"
      }
      afterLeaveOrganizationUrl={
        "/org-selection?redirectUrl=" +
        (typeof window !== "undefined" ? window.location.href : "/")
      }
    >
      {!bypassPayment && (
        <OrganizationSwitcher.OrganizationProfilePage
          label="billing"
          labelIcon={<CreditCardIcon />}
          url="billing"
        >
          <BillingPage />
        </OrganizationSwitcher.OrganizationProfilePage>
      )}
    </OrganizationSwitcher>
  );
}
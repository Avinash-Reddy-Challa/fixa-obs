"use client";

import { useOrganization, useUser } from "@clerk/nextjs";
import { usePostHog } from "posthog-js/react";
import { useEffect, useRef } from "react";

export function PostHogIdentify() {
  const posthog = usePostHog();
  const { user, isLoaded, isSignedIn } = useUser();
  const prevUserId = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (isLoaded && isSignedIn && user && posthog) {
      if (prevUserId.current !== user.id) {
        const email = user.primaryEmailAddress?.emailAddress;
        try {
          posthog.identify(user.id, {
            email,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
          });
          prevUserId.current = user.id;
        } catch (error) {
          console.error("Error identifying user in PostHog:", error);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, isSignedIn, user, posthog]);

  const { organization, isLoaded: organizationLoaded } = useOrganization();
  const prevOrganizationId = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (organizationLoaded && organization && posthog) {
      if (
        !prevOrganizationId.current ||
        prevOrganizationId.current !== organization.id
      ) {
        try {
          // Check if the group method exists on posthog
          if (typeof posthog.group === 'function') {
            posthog.group("organization", organization.id, {
              id: organization.id,
              name: organization.name,
            });
          } else {
            // Alternative approach if group is not available
            posthog.capture('organization_identified', {
              organization_id: organization.id,
              organization_name: organization.name
            });
          }
          prevOrganizationId.current = organization.id;
        } catch (error) {
          console.error("Error setting organization in PostHog:", error);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organization, organizationLoaded, posthog]);

  return null;
}
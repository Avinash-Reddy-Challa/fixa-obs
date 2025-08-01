"use client";
import React from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "../ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import {
  BeakerIcon,
  ChartBarIcon,
  ChevronDownIcon,
  DocumentCheckIcon,
  DocumentIcon,
  EllipsisHorizontalIcon,
  LifebuoyIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { removeTrailingSlash } from "~/lib/utils";
import { api } from "~/trpc/react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { type SavedSearchWithIncludes } from "@repo/types/src";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import Spinner from "../Spinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useOrganization, UserButton } from "@clerk/nextjs";
import { DocumentTextIcon, KeyIcon } from "@heroicons/react/24/outline";
import { OpenInNewWindowIcon } from "@radix-ui/react-icons";
import { ErrorBoundary } from "../ErrorBoundary";
import { CustomOrganizationSwitcher } from "../CustomOrganizationSwitcher";
import Logo from "../Logo";
import { useObserveState } from "../hooks/useObserveState";
import { DemoBanner } from "~/components/demo/DemoBanner";

export default function ObserveSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isDemo } = useObserveState();

  const rootPath = useMemo(() => (isDemo ? "demo" : "observe"), [isDemo]);

  const isCurrentPath = useCallback(
    (path: string) => {
      if (path === "/") {
        return removeTrailingSlash(pathname) === `/${rootPath}`;
      }
      return (
        removeTrailingSlash(pathname) ===
        removeTrailingSlash(`/${rootPath}${path}`)
      );
    },
    [pathname, rootPath],
  );

  const { data: savedSearches } = api.search.getAll.useQuery({
    includeDefault: false,
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [curSavedSearch, setCurSavedSearch] =
    useState<SavedSearchWithIncludes | null>(null);

  const allowTesting = false; // Set to true if needed
  const testsPageEnabled = false; // Set to true if needed

  // Invalidate everything when organization changes
  const utils = api.useUtils();
  const { organization, isLoaded: organizationLoaded } = useOrganization();
  const prevOrganizationId = useRef<string | undefined>(undefined);

  // Fixed useEffect that properly handles cleanup
  useEffect(() => {
    if (organizationLoaded && organization) {
      if (
        prevOrganizationId.current &&
        prevOrganizationId.current !== organization.id
      ) {
        // Don't return the Promise - just execute it
        utils.invalidate().catch(error => {
          console.error('Error invalidating cache:', error);
        });
      }
      prevOrganizationId.current = organization.id;
    }
  }, [organization, organizationLoaded, utils]);

  return (
    <>
      <Sidebar>
        <SidebarHeader>
          <div className="-m-2 flex h-14 items-center justify-between border-b px-4 lg:h-[60px]">
            {allowTesting ? (
              <Select
                defaultValue="observability"
                onValueChange={(value) => {
                  if (value === "testing") {
                    router.push(`/dashboard/new`);
                  }
                }}
              >
                <SelectTrigger className="-ml-2 mr-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="testing">testing</SelectItem>
                  <SelectItem value="observability">observability</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <Logo href={`/${rootPath}`} />
            )}
            {!isDemo && <UserButton />}
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isCurrentPath("/")}>
                    <Link href={`/${rootPath}`}>
                      <ChartBarIcon />
                      <span>dashboard</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={isCurrentPath("/eval-templates")}
                  >
                    <Link href={`/${rootPath}/eval-templates`}>
                      <DocumentCheckIcon />
                      <span>evaluation templates</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                {testsPageEnabled && (
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={isCurrentPath("/tests")}
                    >
                      <Link href={`/${rootPath}/tests`}>
                        <BeakerIcon />
                        <span>test calls</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
                <Collapsible defaultOpen className="group/collapsible">
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton isActive={isCurrentPath("/saved")}>
                        <DocumentIcon className="h-4 w-4" />
                        <span>saved searches</span>
                        <div className="flex-1" />
                        <ChevronDownIcon className="h-4 w-4 transition-transform duration-200 group-data-[state=closed]/collapsible:rotate-[-90deg]" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {savedSearches?.map((search) => (
                          <SidebarMenuSubItem key={search.id}>
                            <SidebarMenuSubButton
                              asChild
                              isActive={isCurrentPath(`/saved/${search.id}`)}
                              className="group/saved-search-item relative data-[active=true]:font-medium"
                            >
                              <Link href={`/${rootPath}/saved/${search.id}`}>
                                <p className="truncate">{search.name}</p>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="absolute right-0 size-6 text-muted-foreground opacity-0 duration-200 hover:bg-gray-200 group-hover/saved-search-item:opacity-100 data-[state=open]:bg-gray-200 data-[state=open]:opacity-100"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <EllipsisHorizontalIcon className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent>
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setCurSavedSearch(search);
                                        setRenameDialogOpen(true);
                                      }}
                                    >
                                      rename
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setCurSavedSearch(search);
                                        setDeleteDialogOpen(true);
                                      }}
                                    >
                                      delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={isCurrentPath("/api-keys")}
                  >
                    <Link href={`/${rootPath}/api-keys`}>
                      <KeyIcon />
                      <span>API keys</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link
                      href={`https://docs.fixa.dev/fixa-observe`}
                      target="_blank"
                    >
                      <DocumentTextIcon />
                      <span>documentation</span>
                    </Link>
                  </SidebarMenuButton>
                  <SidebarMenuBadge>
                    <OpenInNewWindowIcon />
                  </SidebarMenuBadge>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link
                      href={`https://discord.gg/rT9cYkfybZ`}
                      target="_blank"
                    >
                      <LifebuoyIcon />
                      <span>support</span>
                    </Link>
                  </SidebarMenuButton>
                  <SidebarMenuBadge>
                    <OpenInNewWindowIcon />
                  </SidebarMenuBadge>
                </SidebarMenuItem>
                {!isDemo && (
                  <SidebarMenuItem>
                    <SidebarMenuButton>
                      <ErrorBoundary fallback={<div>Organization menu unavailable</div>}>
                        <div>
                          <CustomOrganizationSwitcher />
                        </div>
                      </ErrorBoundary>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
                {isDemo && (
                  <SidebarMenuItem>
                    <DemoBanner />
                  </SidebarMenuItem>
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarFooter>
      </Sidebar>

      <RenameDialog
        open={renameDialogOpen}
        onOpenChange={setRenameDialogOpen}
        savedSearch={curSavedSearch}
      />

      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        savedSearch={curSavedSearch}
        rootPath={rootPath}
      />
    </>
  );
}

function RenameDialog({
  open,
  onOpenChange,
  savedSearch,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  savedSearch: SavedSearchWithIncludes | null;
}) {
  const utils = api.useUtils();
  const { mutate: updateSavedSearch, isPending } =
    api.search.update.useMutation({
      onSuccess: () => {
        onOpenChange(false);
        void utils.search.getAll.invalidate();
      },
    });
  const [newName, setNewName] = useState("");

  useEffect(() => {
    if (savedSearch) {
      setNewName(savedSearch.name);
    }
  }, [savedSearch]);

  const handleRename = useCallback(() => {
    if (savedSearch) {
      updateSavedSearch({ ...savedSearch, name: newName });
    }
  }, [savedSearch, newName, updateSavedSearch]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>rename saved search</DialogTitle>
        </DialogHeader>
        <Input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder={savedSearch?.name}
          autoFocus
          onFocus={(e) => e.target.select()}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleRename();
            }
          }}
        />
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            cancel
          </Button>
          <Button onClick={handleRename} disabled={isPending}>
            {isPending ? <Spinner className="size-4" /> : "rename"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DeleteDialog({
  open,
  onOpenChange,
  savedSearch,
  rootPath,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  savedSearch: SavedSearchWithIncludes | null;
  rootPath: string;
}) {
  const pathname = usePathname();
  const utils = api.useUtils();
  const router = useRouter();

  const { mutate: deleteSavedSearch, isPending } =
    api.search.delete.useMutation({
      onSuccess: () => {
        onOpenChange(false);
        void utils.search.getAll.invalidate();

        const currentPathId = pathname.split("/").pop();
        if (currentPathId === savedSearch?.id) {
          router.push(`/${rootPath}`);
        }
      },
    });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>are you sure?</DialogTitle>
          <DialogDescription>
            are you sure you want to delete &quot;{savedSearch?.name}&quot;?
            this action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            cancel
          </Button>
          <Button
            onClick={() => {
              if (savedSearch) {
                deleteSavedSearch({ id: savedSearch.id });
              }
            }}
            disabled={isPending}
          >
            {isPending ? <Spinner className="size-4" /> : "delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
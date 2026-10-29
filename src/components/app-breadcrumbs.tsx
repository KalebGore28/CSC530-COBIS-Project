import React from "react";
import { Link } from "@tanstack/react-router";
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type BreadcrumbData = {
  path: string;
  title: string;
};

type AppBreadcrumbsProps = {
  breadcrumbs: BreadcrumbData[];
  collapseAfter?: number;
};

export function AppBreadcrumbs({ breadcrumbs, collapseAfter = 4 }: AppBreadcrumbsProps) {
  if (breadcrumbs.length === 0) return null;

  const lastIndex = breadcrumbs.length - 1;

  // Show all breadcrumbs when short enough
  if (breadcrumbs.length <= collapseAfter) {
    return (
      <Breadcrumb>
        <BreadcrumbList>
          {breadcrumbs.map((crumb, index) => {
            const isLast = index === lastIndex;

            return (
              <React.Fragment key={crumb.path}>
                <BreadcrumbItem className={isLast ? undefined : "hidden md:block"}>
                  {isLast ? (
                    <BreadcrumbPage>{crumb.title}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link to={crumb.path}>{crumb.title}</Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>

                {!isLast && <BreadcrumbSeparator className="hidden md:block" />}
              </React.Fragment>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
    );
  }

  const first = breadcrumbs[0];
  const last = breadcrumbs[lastIndex];
  const secondToLast = breadcrumbs[lastIndex - 1];

  // Everything between first and second-to-last goes in the dropdown
  const hiddenItems = breadcrumbs.slice(1, lastIndex - 1);

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem className="hidden md:block">
          <BreadcrumbLink asChild>
            <Link to={first.path}>{first.title}</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        <BreadcrumbSeparator className="hidden md:block" />

        <BreadcrumbItem className="hidden md:block">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" className="h-7 w-7">
                <BreadcrumbEllipsis className="h-4 w-4" />
                <span className="sr-only">Toggle breadcrumb menu</span>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="start">
              <DropdownMenuGroup>
                {hiddenItems.map((crumb) => (
                  <DropdownMenuItem key={crumb.path} asChild>
                    <Link to={crumb.path}>{crumb.title}</Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </BreadcrumbItem>

        <BreadcrumbSeparator className="hidden md:block" />

        <BreadcrumbItem className="hidden md:block">
          <BreadcrumbLink asChild>
            <Link to={secondToLast.path}>{secondToLast.title}</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        <BreadcrumbSeparator className="hidden md:block" />

        <BreadcrumbItem>
          <BreadcrumbPage>{last.title}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}

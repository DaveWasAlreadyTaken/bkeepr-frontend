import { ReactNode } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface PaginationWrapperProps {
  children: ReactNode;
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
  className?: string;
}

export function PaginationWrapper({
  children,
  meta,
  onPageChange,
  className = "",
}: PaginationWrapperProps) {
  return (
    <div className={className}>
      {children}

      <div className="mt-4 flex justify-center">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <Button
                variant="ghost"
                onClick={() => onPageChange(meta.page - 1)}
                disabled={meta.page <= 1}
              >
                <PaginationPrevious />
              </Button>
            </PaginationItem>

            {/* Erste Seite */}
            {meta.page > 2 && (
              <PaginationItem>
                <PaginationLink onClick={() => onPageChange(1)}>
                  1
                </PaginationLink>
              </PaginationItem>
            )}

            {/* Ellipsis am Anfang */}
            {meta.page > 3 && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}

            {/* Vorherige Seite */}
            {meta.page > 1 && (
              <PaginationItem>
                <PaginationLink onClick={() => onPageChange(meta.page - 1)}>
                  {meta.page - 1}
                </PaginationLink>
              </PaginationItem>
            )}

            {/* Aktuelle Seite */}
            <PaginationItem>
              <PaginationLink isActive>{meta.page}</PaginationLink>
            </PaginationItem>

            {/* Nächste Seite */}
            {meta.page < meta.totalPages && (
              <PaginationItem>
                <PaginationLink onClick={() => onPageChange(meta.page + 1)}>
                  {meta.page + 1}
                </PaginationLink>
              </PaginationItem>
            )}

            {/* Ellipsis am Ende */}
            {meta.page < meta.totalPages - 2 && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}

            {/* Letzte Seite */}
            {meta.page < meta.totalPages - 1 && (
              <PaginationItem>
                <PaginationLink onClick={() => onPageChange(meta.totalPages)}>
                  {meta.totalPages}
                </PaginationLink>
              </PaginationItem>
            )}

            <PaginationItem>
              <Button
                variant="ghost"
                onClick={() => onPageChange(meta.page + 1)}
                disabled={meta.page >= meta.totalPages}
              >
                <PaginationNext />
              </Button>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}

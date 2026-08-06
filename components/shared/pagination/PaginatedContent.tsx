import { ReactNode } from "react";
import { PaginationMeta, PaginationWrapper } from "./PaginationWrapper";

export interface ApiResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

interface PaginatedContentProps<T> {
  response: ApiResponse<T>;
  onPageChange: (page: number) => void;
  renderContent: (data: T[]) => ReactNode;
  className?: string;
  wrapperClassName?: string;
}

export function PaginatedContent<T>({
  response,
  onPageChange,
  renderContent,
  className = "",
  wrapperClassName = "",
}: PaginatedContentProps<T>) {
  if (!response || !response.data) {
    return null;
  }

  return (
    <div className={className}>
      <PaginationWrapper
        meta={response.meta}
        onPageChange={onPageChange}
        className={wrapperClassName}
      >
        {renderContent(response.data)}
      </PaginationWrapper>
    </div>
  );
}

import { FormSkeleton, PageHeaderSkeleton } from "@/components/shared/skeletons";

export default function Loading() {
  return (
    <>
      <PageHeaderSkeleton />
      <FormSkeleton />
    </>
  );
}

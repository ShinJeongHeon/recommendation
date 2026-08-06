import { AppTabBar } from "@/blocks/app-tab-bar/AppTabBar";

export default function TabsLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex flex-1 flex-col">
      <div className="mx-auto w-full max-w-[1280px] flex-1 px-4 pb-28 sm:px-6 lg:px-8">{children}</div>
      <div className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-md">
        <AppTabBar />
      </div>
    </div>
  );
}

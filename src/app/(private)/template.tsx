export default function PrivateTemplate({ children }: { children: React.ReactNode }) {
  return (
    <div className="ordo-page-enter flex h-full flex-col overflow-hidden">
      {children}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div
      className="flex min-h-screen items-center justify-center"
      style={{ backgroundColor: '#ffffff' }}
    >
      <div className="text-center">
        <h1
          className="text-[28px] font-bold leading-[1.43]"
          style={{ color: '#222222', letterSpacing: '-0.44px' }}
        >
          Dashboard
        </h1>
        <p className="mt-2 text-sm" style={{ color: '#6a6a6a' }}>
          Welcome to DDMS Dashboard
        </p>
      </div>
    </div>
  );
}

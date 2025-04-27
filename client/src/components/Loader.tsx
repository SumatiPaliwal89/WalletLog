export default function Loader({ fullScreen = false }: { fullScreen?: boolean }) {
  return (
    <div className={`flex items-center justify-center ${fullScreen ? 'h-screen' : 'h-40'}`}>
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyber-blue"></div>
    </div>
  );
}
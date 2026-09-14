export default function StatusDot({ status }) {
  if (!status) {
    return (
      <span
        className="w-2 h-2 rounded-full bg-gray-300 shrink-0 inline-block"
        title="Verificando status..."
      />
    );
  }
  const online = status === "online";
  return (
    <span
      className={`w-2 h-2 rounded-full shrink-0 inline-block ${
        online
          ? "bg-green-500 shadow-[0_0_4px_rgba(34,197,94,0.6)]"
          : "bg-red-500"
      }`}
      title={online ? "Online" : "Offline"}
    />
  );
}
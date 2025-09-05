"use client";

export default function MapInstructions() {
  return (
    <div className="absolute bottom-4 left-4 bg-white p-4 rounded-lg shadow-lg border max-w-sm z-10">
      <h3 className="font-bold text-sm mb-2">Map Instructions</h3>
      <div className="text-xs text-gray-600 space-y-1">
        <p>• <strong>Hover</strong> over counties to see basic info</p>
        <p>• <strong>Click</strong> on counties to view agencies</p>
        <p>• <strong>Blue counties</strong> have agencies, gray ones don't</p>
        <p>• <strong>Fuzzy matching</strong> handles name variations</p>
        <p>• <strong>Sidebar</strong> shows detailed agency list</p>
      </div>
    </div>
  );
}

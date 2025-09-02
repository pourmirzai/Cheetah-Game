import GameContainer from "@/components/game/GameContainer";

export default function Game() {
  return (
    <div className="w-full min-h-dvh md:overflow-hidden overflow-y-auto overflow-x-hidden">
      <GameContainer />
    </div>
  );
}

import { KanbanBoard } from "@/components/KanbanBoard";
import { initialKanbanData } from "@/data/mockData";

const Index = () => {
  return <KanbanBoard initialData={initialKanbanData} />;
};

export default Index;

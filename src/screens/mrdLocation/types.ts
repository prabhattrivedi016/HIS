type RoomItem = {
  roomId: number;
  name: string;
  isActive: number;
};

type RackItem = {
  rackId: number;
  roomId: number;
  name: string;
  isActive: number;
};

type ShelfItem = {
  shelfId: number;
  roomId: number;
  rackId: number;
  name: string;
  isActive: number;
};

export type { RackItem, RoomItem, ShelfItem };

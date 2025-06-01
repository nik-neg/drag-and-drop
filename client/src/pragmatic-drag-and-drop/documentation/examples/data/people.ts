import { RoleEnum } from '@/enums/role-enum';
import Alexander from './people/images/processed/Alexander';
import Aliza from './people/images/processed/Aliza';
import Alvin from './people/images/processed/Alvin';
import Angie from './people/images/processed/Angie';
import Arjun from './people/images/processed/Arjun';

export type Person = {
  userId: string;
  name: string;
  role?: string;
  avatarUrl?: string;
};

export type ColumnType = {
  columnId: string;
  title: string;
  items: Person[];
};

export type ColumnMap = {
  [key: string]: ColumnType;
};

export const getBasicData = (): {
  columnMap: ColumnMap;
  orderedColumnIds: string[];
} => {
  const columnMap: ColumnMap = {
    'column-1': {
      columnId: 'column-1',
      title: 'To Do',
      items: [
        { userId: '1', name: 'Task 1', role: RoleEnum.DEVELOPER, avatarUrl: Alexander },
        { userId: '2', name: 'Task 2', role: RoleEnum.DEVELOPER, avatarUrl: Aliza },
      ],
    },
    'column-2': {
      columnId: 'column-2',
      title: 'In Progress',
      items: [{ userId: '3', name: 'Task 3', role: RoleEnum.DEVELOPER, avatarUrl: Alvin }],
    },
    'column-3': {
      columnId: 'column-3',
      title: 'Done',
      items: [
        { userId: '4', name: 'Task 4', role: RoleEnum.PRODUCT_MANAGER, avatarUrl: Angie },
        { userId: '5', name: 'Task 5', role: RoleEnum.HEAD_OF_DESIGN, avatarUrl: Arjun },
      ],
    },
  };

  return {
    columnMap,
    orderedColumnIds: ['column-1', 'column-2', 'column-3'],
  };
};

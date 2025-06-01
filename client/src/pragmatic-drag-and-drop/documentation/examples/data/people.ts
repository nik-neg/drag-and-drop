/**
 * These imports are written out explicitly because they
 * need to be statically analyzable to be uploaded to CodeSandbox correctly.
 */
import Alexander from './people/images/processed/Alexander';
import Aliza from './people/images/processed/Aliza';
import Alvin from './people/images/processed/Alvin';
import Angie from './people/images/processed/Angie';
import Arjun from './people/images/processed/Arjun';
import Blair from './people/images/processed/Blair';
import Claudia from './people/images/processed/Claudia';
import Colin from './people/images/processed/Colin';
import Ed from './people/images/processed/Ed';
import Effie from './people/images/processed/Effie';
import Eliot from './people/images/processed/Eliot';
import Fabian from './people/images/processed/Fabian';
import Gael from './people/images/processed/Gael';
import Gerard from './people/images/processed/Gerard';
import Hasan from './people/images/processed/Hasan';
import Helena from './people/images/processed/Helena';
import Ivan from './people/images/processed/Ivan';
import Katina from './people/images/processed/Katina';
import Lara from './people/images/processed/Lara';
import Leo from './people/images/processed/Leo';
import Lydia from './people/images/processed/Lydia';
import Maribel from './people/images/processed/Maribel';
import Milo from './people/images/processed/Milo';
import Myra from './people/images/processed/Myra';
import Narul from './people/images/processed/Narul';
import Norah from './people/images/processed/Norah';
import Oliver from './people/images/processed/Oliver';
import Rahul from './people/images/processed/Rahul';
import Renato from './people/images/processed/Renato';
import Steve from './people/images/processed/Steve';
import Tanya from './people/images/processed/Tanya';
import Tori from './people/images/processed/Tori';
import Vania from './people/images/processed/Vania';

export type Person = {
  userId: string;
  name: string;
  role: string;
  avatarUrl: string;
};

const avatarMap: Record<string, string> = {
  Alexander,
  Aliza,
  Alvin,
  Angie,
  Arjun,
  Blair,
  Claudia,
  Colin,
  Ed,
  Effie,
  Eliot,
  Fabian,
  Gael,
  Gerard,
  Hasan,
  Helena,
  Ivan,
  Katina,
  Lara,
  Leo,
  Lydia,
  Maribel,
  Milo,
  Myra,
  Narul,
  Norah,
  Oliver,
  Rahul,
  Renato,
  Steve,
  Tanya,
  Tori,
  Vania,
};

const names: string[] = Object.keys(avatarMap);

const roles: string[] = [
  'Engineer',
  'Senior Engineer',
  'Principal Engineer',
  'Engineering Manager',
  'Designer',
  'Senior Designer',
  'Lead Designer',
  'Design Manager',
  'Content Designer',
  'Product Manager',
  'Program Manager',
];

let sharedLookupIndex: number = 0;

/**
 * Note: this does not use randomness so that it is stable for VR tests
 */
export function getPerson(): Person {
  sharedLookupIndex++;
  return getPersonFromPosition({ position: sharedLookupIndex });
}

export function getPersonFromPosition({ position }: { position: number }): Person {
  // use the next name
  const name = names[position % names.length];
  // use the next role
  const role = roles[position % roles.length];
  return {
    userId: `id:${position}`,
    name,
    role,
    avatarUrl: avatarMap[name],
  };
}

export function getPeopleFromPosition({
  amount,
  startIndex,
}: {
  amount: number;
  startIndex: number;
}): Person[] {
  return Array.from({ length: amount }, () => getPersonFromPosition({ position: startIndex++ }));
}

export function getPeople({ amount }: { amount: number }): Person[] {
  return Array.from({ length: amount }, () => getPerson());
}

export type ColumnType = {
  title: string;
  columnId: string;
  items: Person[];
};
export type ColumnMap = { [columnId: string]: ColumnType };

export function getData({
  columnCount,
  itemsPerColumn,
}: {
  columnCount: number;
  itemsPerColumn: number;
}) {
  const columnMap: ColumnMap = {};

  for (let i = 0; i < columnCount; i++) {
    const column: ColumnType = {
      title: `Column ${i}`,
      columnId: `column-${i}`,
      items: getPeople({ amount: itemsPerColumn }),
    };
    columnMap[column.columnId] = column;
  }
  const orderedColumnIds = Object.keys(columnMap);

  return {
    columnMap,
    orderedColumnIds,
    lastOperation: null,
  };
}

export function getBasicData() {
  const columnMap: ColumnMap = {
    confluence: {
      title: 'Confluence',
      columnId: 'confluence',
      items: getPeople({ amount: 10 }),
    },
    jira: {
      title: 'Jira',
      columnId: 'jira',
      items: getPeople({ amount: 10 }),
    },
    trello: {
      title: 'Trello',
      columnId: 'trello',
      items: getPeople({ amount: 10 }),
    },
  };

  const orderedColumnIds = ['confluence', 'jira', 'trello'];

  return {
    columnMap,
    orderedColumnIds,
  };
}

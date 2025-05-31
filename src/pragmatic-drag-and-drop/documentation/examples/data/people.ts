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

export function getBasicData(): { columnMap: ColumnMap; orderedColumnIds: string[] } {
    const columnMap: ColumnMap = {
        'column-1': {
            columnId: 'column-1',
            title: 'To Do',
            items: [
                { userId: '1', name: 'Task 1' },
                { userId: '2', name: 'Task 2' },
            ],
        },
        'column-2': {
            columnId: 'column-2',
            title: 'In Progress',
            items: [
                { userId: '3', name: 'Task 3' },
            ],
        },
        'column-3': {
            columnId: 'column-3',
            title: 'Done',
            items: [
                { userId: '4', name: 'Task 4' },
                { userId: '5', name: 'Task 5' },
            ],
        },
    };

    return {
        columnMap,
        orderedColumnIds: ['column-1', 'column-2', 'column-3'],
    };
} 
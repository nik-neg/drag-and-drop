import { OutcomeEnum } from '@/enums/outcome.enum';
import { TriggerEnum } from '@/enums/trigger.enum';
import type { ColumnMap } from '@/pragmatic-drag-and-drop/documentation/examples/data/people';

export type Outcome =
  | {
      type: OutcomeEnum.COLUMN_REORDER;
      columnId: string;
      startIndex: number;
      finishIndex: number;
    }
  | {
      type: OutcomeEnum.CARD_REORDER;
      columnId: string;
      startIndex: number;
      finishIndex: number;
    }
  | {
      type: OutcomeEnum.CARD_MOVE;
      finishColumnId: string;
      itemIndexInStartColumn: number;
      itemIndexInFinishColumn: number;
    };

export type Operation = {
  trigger: TriggerEnum;
  outcome: Outcome;
};

export type BoardState = {
  columnMap: ColumnMap;
  orderedColumnIds: string[];
  lastOperation: Operation | null;
};

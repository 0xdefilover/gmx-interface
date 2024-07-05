import { useTradeboxMarkPrice, useTradeboxSelectedPosition } from "context/SyntheticsStateContext/hooks/tradeboxHooks";
import { makeSelectOrdersByPositionKey } from "context/SyntheticsStateContext/selectors/orderSelectors";
import { selectTradeboxSelectedPositionKey } from "context/SyntheticsStateContext/selectors/tradeboxSelectors";
import { useSelector } from "context/SyntheticsStateContext/utils";
import { isTriggerDecreaseOrderType } from "domain/synthetics/orders";
import { TriggerThresholdType } from "domain/synthetics/trade";

import { useMemo } from "react";

export function useDecreaseOrdersThatWillBeExecuted() {
  const markPrice = useTradeboxMarkPrice();
  const existingPosition = useTradeboxSelectedPosition();
  const positionKey = useSelector(selectTradeboxSelectedPositionKey);
  const positionOrders = useSelector(makeSelectOrdersByPositionKey(positionKey));

  const existingTriggerOrders = useMemo(
    () => positionOrders.filter((order) => isTriggerDecreaseOrderType(order.orderType)),
    [positionOrders]
  );

  return useMemo(() => {
    if (!existingPosition || markPrice === undefined) {
      return [];
    }

    return existingTriggerOrders.filter((order) => {
      return order.triggerThresholdType === TriggerThresholdType.Above
        ? markPrice > order.triggerPrice
        : markPrice < order.triggerPrice;
    });
  }, [existingPosition, existingTriggerOrders, markPrice]);
}

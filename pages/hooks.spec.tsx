import { useState } from "react";
import { renderHook, act } from "@testing-library/react-hooks";

// 模拟这个是一个待测的hooks
function useHaveLabel(): [boolean, (e: { currentTarget: { value: string } }) => void] {
  const [haveLabel, setHaveLabel] = useState(false);
  const handleChangeHaveLabel = (e: { currentTarget: { value: string } }) => {
    if (haveLabel && !e.currentTarget.value) {
      setHaveLabel(false);
    }
    if (!haveLabel && e.currentTarget.value) {
      setHaveLabel(true);
    }
  };
  return [haveLabel, handleChangeHaveLabel];
}

test("should test hooks", () => {
  const { result } = renderHook(() => useHaveLabel());

  act(() => {
    result.current[1]({ currentTarget: { value: "20" } });
  });

  expect(result.current[0]).toBe(true);

  act(() => {
    result.current[1]({ currentTarget: { value: "" } });
  });

  expect(result.current[0]).toBe(false);
});

import "@testing-library/jest-dom";
import { render } from "@testing-library/react";
import { useState } from "react";
import { renderHook, act } from "@testing-library/react-hooks";

// 模拟这个是一个待测的组件
function Page() {
  const [num, setNum] = useState(0);
  const handleAddNum = () => {
    setNum(num + 1);
  };

  return (
    <div>
      <div>
        num: {num}
        <button className="bg-gray-200 p-2 m-3" onClick={handleAddNum}>
          add num
        </button>
      </div>
    </div>
  );
}

test("renders learn react link", () => {
  const view = render(<Page />);
  const linkElement = view.getByText(/add num/i);
  expect(linkElement).toBeInTheDocument();
});

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

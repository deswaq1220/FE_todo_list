import { useEffect, useState, useMemo } from 'react';
import { Priority, Todo, todoListState } from '../recoil/atoms/todoState';
import TodoItem from './TodoItem';
import {
  collection,
  orderBy,
  query,
  onSnapshot,
  updateDoc,
  doc,
  where,
} from 'firebase/firestore';
import { auth, database } from '../firebase/firebase';
import { searchState } from '../recoil/atoms/searchState';
import { useRecoilState, useRecoilValue } from 'recoil';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { selectedDateState } from '../recoil/atoms/dateState';
import { useAuthState } from 'react-firebase-hooks/auth';

// 우선순위별 레이블 및 색상 정의
const priorityConfig: Record<
  Priority,
  { label: string; bgColor: string; textColor: string }
> = {
  high: {
    label: '높음',
    bgColor: 'bg-todayRed/20',
    textColor: 'text-todayRed',
  },
  medium: {
    label: '중간',
    bgColor: 'bg-todayYellow/20',
    textColor: 'text-todayYellow',
  },
  low: {
    label: '낮음',
    bgColor: 'bg-todayGreen/20',
    textColor: 'text-todayGreen',
  },
};

const TodoList = () => {
  const [todos, setTodos] = useRecoilState(todoListState);
  const [user] = useAuthState(auth);
  const [loading, setLoading] = useState(true);

  // 그룹화 표시 여부 상태 추가
  const [groupByPriority, setGroupByPriority] = useState(true);

  const searchTerm = useRecoilValue(searchState);
  const selectedDate = useRecoilValue(selectedDateState);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // 같은 날짜인지 확인하는 유틸리티 함수
  const isSameDay = (date1: Date | string, date2: Date | string) => {
    const d1 = date1 instanceof Date ? date1 : new Date(date1);
    const d2 = date2 instanceof Date ? date2 : new Date(date2);

    return (
      d1.getDate() === d2.getDate() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getFullYear() === d2.getFullYear()
    );
  };

  const filteredTodos = todos.filter((todo) => {
    // 검색어 필터링
    const matchesSearch = searchTerm
      ? todo.text.toLowerCase().includes(searchTerm.toLowerCase())
      : true;

    // 날짜 필터링
    let matchesDate = true;

    if (selectedDate) {
      // 단일 날짜 할 일 또는 날짜 범위가 지정되지 않은 할 일
      if (!todo.repeatType || todo.repeatType === 'none') {
        matchesDate = todo.startDate
          ? isSameDay(new Date(todo.startDate), selectedDate)
          : true;
      }
      // 날짜 범위가 있는 할 일
      else if (todo.repeatType === 'range' && todo.startDate && todo.endDate) {
        const startDate = new Date(todo.startDate);
        const endDate = new Date(todo.endDate);

        // 선택된 날짜가 시작일과 종료일 사이에 있는지 확인
        matchesDate = selectedDate >= startDate && selectedDate <= endDate;
      }
    }

    // 두 조건 모두 만족해야 함
    return matchesSearch && matchesDate;
  });

  // 우선순위별로 그룹화하는 로직
  const groupedTodos = useMemo(() => {
    const groups: Record<Priority, Todo[]> = {
      high: [],
      medium: [],
      low: [],
    };

    filteredTodos.forEach((todo) => {
      const priority = (todo.priority || 'undefined') as Priority;
      groups[priority].push(todo);
    });

    // 각 그룹 내에서 order 값으로 정렬
    Object.keys(groups).forEach((key) => {
      const priority = key as Priority;
      groups[priority].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    });

    return groups;
  }, [filteredTodos]);

  const handleDelete = (id: string) => {
    setTodos((prev) => prev.filter((todo) => todo.firebaseId !== id));
  };

  const handleUpdate = (id: string, updates: Partial<Todo>) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.firebaseId === id ? { ...todo, ...updates } : todo
      )
    );
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    setTodos((items) => {
      const oldIndex = items.findIndex((item) => item.firebaseId === active.id);
      const newIndex = items.findIndex((item) => item.firebaseId === over.id);

      const newItems = arrayMove(items, oldIndex, newIndex);

      // firebaseId가 있는 항목만 필터링하여 업데이트
      newItems
        .filter(
          (item): item is Todo & { firebaseId: string } =>
            item.firebaseId !== undefined
        )
        .forEach(async (item, index) => {
          const todoRef = doc(database, 'todos', item.firebaseId);
          await updateDoc(todoRef, {
            order: index,
          });
        });

      return newItems;
    });
  };

  useEffect(() => {
    if (!user) {
      setTodos([]);
      setLoading(false);
      return () => {};
    }

    const q = query(
      collection(database, 'todos'),
      where('userId', '==', user.uid), // 사용자 ID로 필터링
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const firestoreTodos: Todo[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          firestoreTodos.push({
            id: Date.now(),
            firebaseId: doc.id,
            text: data.text,
            isComplete: data.isComplete,
            priority: data.priority,
            notes: data.notes,
            order: data.order || 0,
            userId: data.userId,
            createdAt:
              data.createdAt instanceof Date
                ? data.createdAt.toISOString()
                : data.createdAt?.toDate?.()?.toISOString() ||
                  new Date().toISOString(),
            startDate:
              data.startDate || data.createdAt?.toDate?.()?.toISOString(),
            endDate: data.endDate || data.startDate,
            repeatType: data.repeatType || 'none',
          });
        });

        setTodos(
          firestoreTodos.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        );
        setLoading(false);
      },
      (error: any) => {
        console.error('데이터 가져오기 에러', error.code, error.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, setTodos]);

  const toggleGrouping = () => {
    setGroupByPriority(!groupByPriority);
  };

  if (!user) {
    return (
      <div className='py-8 text-center text-gray-500'>
        로그인이 필요합니다. 할 일을 관리하려면 로그인해주세요.
      </div>
    );
  }

  if (loading) {
    return <div className='py-8 text-center text-gray-500'>로딩 중...</div>;
  }

  if (filteredTodos.length === 0) {
    return (
      <div className='py-8 text-center text-gray-500'>
        {searchTerm
          ? '검색 결과가 없습니다.'
          : '할 일이 없습니다. 새로운 할 일을 추가해보세요!'}
      </div>
    );
  }

  return (
    <>
      <div className='mb-4 flex items-center justify-end'>
        <button
          onClick={toggleGrouping}
          className='bg-todayPink cursor-pointer rounded px-3 py-1 text-sm text-white transition-colors hover:bg-[#e95781]'
        >
          {groupByPriority ? '우선순위 그룹 해제' : '우선순위별로 그룹화'}
        </button>
      </div>

      {groupByPriority ? (
        // 우선순위별 그룹화된 뷰
        <div className='space-y-6'>
          {(Object.keys(groupedTodos) as Priority[]).map((priority) => {
            const todosInGroup = groupedTodos[priority];
            if (todosInGroup.length === 0) return null;

            const { label, bgColor, textColor } = priorityConfig[priority];

            return (
              <div key={priority} className='space-y-2'>
                <div
                  className={`${bgColor} ${textColor} rounded-lg px-3 py-2 font-medium`}
                >
                  우선순위: {label} ({todosInGroup.length})
                </div>
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={todosInGroup
                      .filter((todo) => todo.firebaseId)
                      .map((todo) => todo.firebaseId!)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className='space-y-2 pl-2'>
                      {todosInGroup.map((todo) => (
                        <TodoItem
                          key={todo.firebaseId}
                          todo={todo}
                          onDelete={handleDelete}
                          onUpdate={handleUpdate}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              </div>
            );
          })}
        </div>
      ) : (
        // 기존 방식의 리스트 뷰
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={filteredTodos
              .filter((todo) => todo.firebaseId)
              .map((todo) => todo.firebaseId!)}
            strategy={verticalListSortingStrategy}
          >
            <div className='mt-4 space-y-2'>
              {filteredTodos.map((todo) => (
                <TodoItem
                  key={todo.firebaseId}
                  todo={todo}
                  onDelete={handleDelete}
                  onUpdate={handleUpdate}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </>
  );
};

export default TodoList;

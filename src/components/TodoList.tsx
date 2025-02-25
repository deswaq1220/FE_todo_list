import { useEffect, useState } from 'react';
import { Todo } from '../recoil/atoms/todoState';
import TodoItem from './TodoItem';
import {
  collection,
  orderBy,
  query,
  onSnapshot,
  updateDoc,
  doc,
} from 'firebase/firestore';
import { database } from '../firebase/firebase';
import { searchState } from '../recoil/atoms/searchState';
import { useRecoilValue } from 'recoil';
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

const TodoList = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);

  const searchTerm = useRecoilValue(searchState);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const filteredTodos = searchTerm
    ? todos.filter((todo) =>
        todo.text.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : todos;

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
    const q = query(
      collection(database, 'todos'),
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
            createdAt:
              data.createdAt?.toDate()?.toISOString() ||
              new Date().toISOString(),
          });
        });

        setTodos(
          firestoreTodos.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        );
        setLoading(false);
      },
      (error: any) => {
        console.error('데이터 가져오기 에러', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

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

  console.log(todos);

  return (
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
  );
};

export default TodoList;

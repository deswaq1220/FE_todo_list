import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { Priority, Todo, activeNotesIdState } from '../recoil/atoms/todoState';
import { GripVertical, Pen, X, Check, MessageSquare } from 'lucide-react';
import { database } from '../firebase/firebase';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { UniqueIdentifier } from '@dnd-kit/core';
import { useState, useEffect } from 'react';
import { useRecoilState } from 'recoil';
import { useNotes } from '../hooks/useNotes';

type TodoWithNotes = Todo & {
  notes?: string;
};

type TodoItemProps = {
  todo: TodoWithNotes;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<TodoWithNotes>) => void;
};

const TodoItem = ({ todo, onDelete, onUpdate }: TodoItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);
  const [editPriority, setEditPriority] = useState<Priority>(todo.priority);
  const [activeNotesId, setActiveNotesId] = useRecoilState(activeNotesIdState);

  // 커스텀 훅 사용
  const {
    showNotes,
    editNotes,
    hasUnsavedNotes,
    toggleNotes,
    handleNotesChange,
    saveNotes,
    setShowNotes,
  } = useNotes(todo);

  const firebaseId: UniqueIdentifier = todo.firebaseId as string;
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: firebaseId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getPriorityStyle = (priority: Priority) => {
    switch (priority) {
      case 'high':
        return {
          bg: 'bg-todayRed/10',
          text: 'text-todayRed',
          ring: 'ring-todayRed',
          dot: 'bg-todayRed',
          label: '높음',
        };
      case 'medium':
        return {
          bg: 'bg-todayYellow/10',
          text: 'text-todayYellow',
          ring: 'ring-todayYellow',
          dot: 'bg-todayYellow',
          label: '중간',
        };
      case 'low':
        return {
          bg: 'bg-todayGreen/10',
          text: 'text-todayGreen',
          ring: 'ring-todayGreen',
          dot: 'bg-todayGreen',
          label: '낮음',
        };
    }
  };

  const priorityStyle = getPriorityStyle(todo.priority);

  const toggleComplete = async () => {
    if (todo.firebaseId) {
      try {
        await updateDoc(doc(database, 'todos', todo.firebaseId), {
          isComplete: !todo.isComplete,
        });
        onUpdate(todo.firebaseId, { isComplete: !todo.isComplete });
      } catch (error) {
        console.error('업데이트 중 오류!:', error);
      }
    }
  };

  const handleDelete = async () => {
    if (todo.firebaseId) {
      try {
        await deleteDoc(doc(database, 'todos', todo.firebaseId));
        onDelete(todo.firebaseId);
      } catch (error) {
        console.error('삭제 중 오류!:', error);
      }
    }
  };

  const handleEdit = () => {
    // 수정 모드로 전환하면서 메모 창은 닫기
    setShowNotes(false);
    setIsEditing(true);
    setEditText(todo.text);
    setEditPriority(todo.priority);
  };

  const handleSaveEdit = async () => {
    if (todo.firebaseId && editText.trim() !== '') {
      try {
        // 메모 데이터 포함하여 업데이트
        const updates = {
          text: editText,
          priority: editPriority,
          notes: todo.notes || '', // 기존 메모 유지
        };

        await updateDoc(doc(database, 'todos', todo.firebaseId), updates);
        onUpdate(todo.firebaseId, updates);
        setIsEditing(false);
      } catch (error) {
        console.error('수정 중 오류!:', error);
      }
    }
  };

  // 현재 TodoItem의 메모가 활성화될 때 다른 메모 닫기를 위한 Recoil 상태 관리
  useEffect(() => {
    if (showNotes && todo.firebaseId) {
      setActiveNotesId(todo.firebaseId);
    }
  }, [showNotes, todo.firebaseId, setActiveNotesId]);

  // 다른 TodoItem의 메모가 활성화되면 현재 메모 닫기
  useEffect(() => {
    if (activeNotesId && activeNotesId !== todo.firebaseId && showNotes) {
      // 닫기 전에 자동 저장
      if (hasUnsavedNotes) {
        saveNotes();
      }
      setShowNotes(false);
    }
  }, [activeNotesId, todo.firebaseId, showNotes, hasUnsavedNotes]);

  // todo 객체가 변경될 때 상태 업데이트
  useEffect(() => {
    setEditText(todo.text);
    setEditPriority(todo.priority);
  }, [todo]);

  // 수정 모드 UI
  if (isEditing) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className='flex w-full items-center rounded-lg bg-white p-2 px-2.5 shadow-sm'
      >
        <button
          className='mr-2 cursor-grab touch-none hover:text-gray-600'
          {...attributes}
          {...listeners}
        >
          <GripVertical color='#99a1af' className='h-5 w-5' />
        </button>

        <div className='mr-2 flex min-w-0 flex-1 flex-col gap-2'>
          <input
            type='text'
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className='w-full rounded p-1 ring ring-gray-200 focus:ring-1 focus:ring-gray-200 focus:outline-none'
            autoFocus
          />
          <div className='flex gap-2'>
            <label className='flex items-center'>
              <input
                type='radio'
                name='priority'
                value='high'
                checked={editPriority === 'high'}
                onChange={() => setEditPriority('high')}
                className='mr-1'
              />
              <span className='text-xs text-rose-600'>높음</span>
            </label>
            <label className='flex items-center'>
              <input
                type='radio'
                name='priority'
                value='medium'
                checked={editPriority === 'medium'}
                onChange={() => setEditPriority('medium')}
                className='mr-1'
              />
              <span className='text-xs text-amber-600'>중간</span>
            </label>
            <label className='flex items-center'>
              <input
                type='radio'
                name='priority'
                value='low'
                checked={editPriority === 'low'}
                onChange={() => setEditPriority('low')}
                className='mr-1'
              />
              <span className='text-xs text-green-600'>낮음</span>
            </label>
          </div>
        </div>

        <div className='flex gap-1'>
          <button
            className='bg-todayGreen/10 flex h-6 w-6 cursor-pointer items-center justify-center rounded'
            onClick={handleSaveEdit}
          >
            <Check size={16} color='#72c18e' />
          </button>
          <button
            className='bg-todayRed/10 flex h-6 w-6 cursor-pointer items-center justify-center rounded'
            onClick={() => setIsEditing(false)}
          >
            <X size={16} color='#f95f5f' />
          </button>
        </div>
      </div>
    );
  }

  // 일반 모드 UI
  return (
    <div
      ref={setNodeRef}
      style={style}
      className='flex w-full flex-col rounded-lg bg-white px-2.5 py-3 shadow-sm'
    >
      {/* 기본 할 일 항목 */}
      <div className='flex w-full items-center'>
        <button
          className='mr-2 cursor-grab touch-none hover:text-gray-600'
          {...attributes}
          {...listeners}
        >
          <GripVertical color='#99a1af' className='h-5 w-5' />
        </button>

        <label className='mr-1 flex min-w-0 flex-1 cursor-pointer items-center text-gray-950'>
          <input
            type='checkbox'
            checked={todo.isComplete}
            onChange={toggleComplete}
            className='mr-2.5 h-5 w-5 rounded border-gray-200 accent-gray-500'
          />
          <span className={todo.isComplete ? 'text-gray-500 line-through' : ''}>
            {todo.text}
          </span>
          <span
            className={
              todo.isComplete
                ? 'ml-1.5 max-w-[200px] overflow-hidden text-xs text-ellipsis whitespace-nowrap text-gray-500 line-through'
                : 'ml-1.5 max-w-[200px] overflow-hidden text-xs text-ellipsis whitespace-nowrap text-gray-500'
            }
            title={todo.notes}
          >
            {todo.notes}
          </span>
        </label>
        <div className='flex items-center gap-1'>
          <span
            className={`inline-flex items-center rounded-2xl ${priorityStyle.bg} px-2 py-1 text-xs font-medium ${priorityStyle.text} ring-1 ${priorityStyle.ring} ring-inset`}
          >
            <span
              className={`mr-1 h-2 w-2 rounded-full ${priorityStyle.dot}`}
            ></span>
            {priorityStyle.label}
          </span>
          <button
            className='relative flex h-6 w-6 cursor-pointer items-center justify-center rounded bg-blue-600/10'
            onClick={() => toggleNotes(isEditing)}
          >
            <MessageSquare size={16} color='#4e91fc' />
            {todo.notes && todo.notes.trim() !== '' && (
              <span className='bg-todayBlue absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full'></span>
            )}
          </button>
          <button
            className='bg-todayYellow/10 flex h-6 w-6 cursor-pointer items-center justify-center rounded'
            onClick={handleEdit}
          >
            <Pen size={16} color='#fca430' />
          </button>
          <button
            className='bg-todayRed/10 flex h-6 w-6 cursor-pointer items-center justify-center rounded'
            onClick={handleDelete}
          >
            <X size={16} color='#f95f5f' />
          </button>
        </div>
      </div>

      {/* 메모 표시/편집 영역 (수정 모드가 아닐 때만 표시) */}
      {showNotes && !isEditing && (
        <div className='mt-2 mr-2 ml-9'>
          <div className='mb-1 flex items-center justify-between'>
            <span className='text-xs text-gray-600'>상세내용</span>
            <div className='flex items-center'>
              {hasUnsavedNotes && (
                <span className='text-todayRed mr-2 text-xs'>
                  저장되지 않음
                </span>
              )}
              <button
                onClick={() => {
                  saveNotes();
                  setShowNotes(false);
                }}
                className='text-todayBlue hover:text-todayNavy text-xs'
              >
                저장
              </button>
            </div>
          </div>
          <textarea
            value={editNotes}
            onChange={handleNotesChange}
            onBlur={saveNotes} // 포커스를 잃을 때 자동 저장
            className='h-16 w-full resize-none rounded border border-gray-200 p-2 text-sm focus:ring-1 focus:ring-gray-300 focus:outline-none'
            placeholder='추가 메모를 입력하세요'
          />
          <div className='mt-1 text-right text-xs'>
            {editNotes ? `${editNotes.length}자` : ''}
          </div>
        </div>
      )}
    </div>
  );
};

export default TodoItem;

import { useState, useEffect } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { database } from '../firebase/firebase';
import { useRecoilState } from 'recoil';
import { todoListState } from '../recoil/atoms/todoState';

type TodoWithNotes = {
  firebaseId?: string;
  notes?: string;
};

const useNotes = (todo: TodoWithNotes) => {
  const [showNotes, setShowNotes] = useState(false);
  const [editNotes, setEditNotes] = useState(todo.notes || '');
  const [hasUnsavedNotes, setHasUnsavedNotes] = useState(false);

  const [todoList, setTodoList] = useRecoilState(todoListState);

  // todo 객체가 변경될 때 메모 내용 업데이트
  useEffect(() => {
    setEditNotes(todo.notes || '');
  }, [todo.notes]);

  const toggleNotes = (isEditing: boolean) => {
    if (isEditing) return; // 수정 중에는 메모 토글 비활성화

    // 메모 창을 닫을 때 자동으로 저장
    if (showNotes && hasUnsavedNotes) {
      saveNotes();
    }

    setShowNotes(!showNotes);
    // 메모가 처음 열릴 때 현재 메모 상태로 설정
    if (!showNotes) {
      setEditNotes(todo.notes || '');
      setHasUnsavedNotes(false);
    }
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditNotes(e.target.value);
    setHasUnsavedNotes(true);
  };

  const saveNotes = async () => {
    if (todo.firebaseId) {
      try {
        const updates = { notes: editNotes };
        await updateDoc(doc(database, 'todos', todo.firebaseId), updates);

        // Recoil 상태 업데이트
        setTodoList(
          todoList.map((item) =>
            item.firebaseId === todo.firebaseId
              ? { ...item, notes: editNotes }
              : item
          )
        );

        setHasUnsavedNotes(false);
      } catch (error) {
        console.error('메모 저장 중 오류!:', error);
      }
    }
  };

  // 페이지 이탈 시 자동 저장 (beforeunload 이벤트)
  useEffect(() => {
    const handleBeforeUnload = async () => {
      if (hasUnsavedNotes && todo.firebaseId) {
        // 페이지 이탈 전에 Firebase에 즉시 저장
        try {
          await updateDoc(doc(database, 'todos', todo.firebaseId), {
            notes: editNotes,
          });
          // Recoil 상태 업데이트는 생략 (페이지 이탈 중이므로)
        } catch (error) {
          console.error('자동 저장 중 오류:', error);
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [editNotes, hasUnsavedNotes, todo.firebaseId]);

  return {
    showNotes,
    editNotes,
    hasUnsavedNotes,
    toggleNotes,
    handleNotesChange,
    saveNotes,
    setShowNotes,
  };
};
export default useNotes;

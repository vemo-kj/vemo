// // editor.tsx
// 'use client';

// // [FIX] Editor import 시 alias 사용 (이름 충돌 방지)
// import React, {
//   useImperativeHandle,
//   forwardRef,
//   useState,
//   useRef
// } from 'react';
// import {
//   Editor as DraftJsEditor, // [FIX] draft-js의 Editor를 DraftJsEditor로 alias
//   EditorState,
//   RichUtils,
//   convertToRaw,
//   convertFromRaw
// } from 'draft-js';
// import { convertToHTML } from 'draft-convert';
// // import { convertToHTML } from 'draft-js-export-html';

// import { ReactSketchCanvas } from 'react-sketch-canvas';

// import 'draft-js/dist/Draft.css';
// import styles from './editor.module.css';
// import MomoItem from './MemoItem';

// // Section, DraftEditorProps 그대로
// interface Section {
//   id: string;
//   timestamp: string;
//   htmlContent: string; // Draft.js 인라인 스타일을 포함한 HTML
//   screenshot?: string;
// }

// interface DraftEditorProps {
//   getTimestamp: () => string;
//   onTimestampClick?: (timestamp: string) => void;
//   onPauseVideo?: () => void; // 영상 정지 (그리기 시)
//   isEditable: boolean; // 항상 true로 설정
// }

// // parseTimeToSeconds는 동일
// function parseTimeToSeconds(timestamp: string): number {
//   const [mm, ss] = timestamp.split(':').map(Number);
//   return (mm || 0) * 60 + (ss || 0);
// }

// // [FIX] ref로 노출할 메서드를 담는 인터페이스 정의
// interface DraftEditorHandle {
//   addCaptureItem: (timestamp: string, imageUrl: string) => void;
// }

// // [FIX] forwardRef<DraftEditorHandle, DraftEditorProps> 형태로 제네릭 적용
// const DraftEditor = forwardRef<DraftEditorHandle, DraftEditorProps>(function DraftEditorRef(
//   { getTimestamp, onTimestampClick, onPauseVideo },
//   ref
// ) {
//   const [sections, setSections] = useState<Section[]>([]);
//   const [editorState, setEditorState] = useState(() => EditorState.createEmpty());

//   const [isFirstInputRecorded, setIsFirstInputRecorded] = useState(false);
//   const [firstInputTimestamp, setFirstInputTimestamp] = useState<string | null>(null);
//   const [lastSavedHTML, setLastSavedHTML] = useState<string>(''); // HTML 저장

//   // ============ 1) 메모 역순 or 정순 =============
//   // 필요한 경우 여기에 로직 작성

//   // ============ 2) addCaptureItem =============
//   // [FIX] useImperativeHandle에서 DraftEditorHandle에 정의한 메서드 구현
//   useImperativeHandle(ref, () => ({
//     addCaptureItem: (timestamp: string, imageUrl: string) => {
//       const newItem: Section = {
//         id: Math.random().toString(36).substr(2, 9),
//         timestamp,
//         htmlContent: '',
//         screenshot: imageUrl
//       };
//       setSections((prev) => [...prev, newItem]);
//     }
//   }));

//   // ============ 3) handleSave (Draft -> HTML)
//   const handleSave = () => {
//     const contentState = editorState.getCurrentContent();
//     if (!contentState.hasText()) return;

//     const html = convertToHTML(contentState);
//     const stamp =
//       isFirstInputRecorded && firstInputTimestamp
//         ? firstInputTimestamp
//         : getTimestamp();

//     const newItem: Section = {
//       id: Math.random().toString(36).substr(2, 9),
//       timestamp: stamp,
//       htmlContent: html
//     };

//     setSections((prev) => [...prev, newItem]);
//     setEditorState(EditorState.createEmpty());
//     setLastSavedHTML(html);
//     setIsFirstInputRecorded(false);
//     setFirstInputTimestamp(null);
//   };

//   // ============ 4) handleKeyCommand (엔터 => 저장)
//   const handleKeyCommand = (command: string) => {
//     if (command === 'submit') {
//       handleSave();
//       return 'handled';
//     }
//     return 'not-handled';
//   };

//   // Draft onChange
//   const handleEditorChange = (newState: EditorState) => {
//     setEditorState(newState);
//     const t = newState.getCurrentContent().getPlainText().trim();
//     if (t.length > 0 && !isFirstInputRecorded) {
//       setIsFirstInputRecorded(true);
//       setFirstInputTimestamp(getTimestamp());
//     }
//   };

//   // 인라인 스타일
//   const isStyleActive = (style: string) =>
//     editorState.getCurrentInlineStyle().has(style);

//   const toggleInlineStyle = (style: string) => {
//     setEditorState((prev) => RichUtils.toggleInlineStyle(prev, style));
//   };

//   // 메모 수정/삭제
//   const handleChangeItem = (id: string, newHTML: string) => {
//     setSections((prev) =>
//       prev.map((s) => (s.id === id ? { ...s, htmlContent: newHTML } : s))
//     );
//   };
//   const handleDeleteItem = (id: string) => {
//     setSections((prev) => prev.filter((s) => s.id !== id));
//   };

//   return (
//     <div className={styles.container}>
//       {/* 메모 목록 */}
//       <div className={styles.displayArea}>
//         {sections.map((item) => (
//           <MomoItem
//             key={item.id}
//             id={item.id}
//             timestamp={item.timestamp}
//             htmlContent={item.htmlContent}
//             screenshot={item.screenshot}
//             onTimestampClick={onTimestampClick}
//             onDelete={() => handleDeleteItem(item.id)}
//             onChangeHTML={(newVal) => handleChangeItem(item.id, newVal)}
//             onPauseVideo={onPauseVideo}
//             isEditable={true}
//           />
//         ))}
//       </div>

//       {/* Draft Editor */}
//       <div className={styles.editorArea}>
//         {/* [FIX] alias로 불러온 DraftJsEditor 사용 */}
//         <DraftJsEditor
//           editorState={editorState}
//           onChange={handleEditorChange}
//           placeholder="내용을 입력하세요..."
//           keyBindingFn={(e) => (e.key === 'Enter' ? 'submit' : null)}
//           handleKeyCommand={handleKeyCommand}
//         />
//         <div className={styles.toolbar}>
//           <button
//             className={isStyleActive('BOLD') ? styles.activeButton : ''}
//             onMouseDown={(e) => {
//               e.preventDefault();
//               toggleInlineStyle('BOLD');
//             }}
//           >
//             B
//           </button>
//           <button
//             className={isStyleActive('ITALIC') ? styles.activeButton : ''}
//             onMouseDown={(e) => {
//               e.preventDefault();
//               toggleInlineStyle('ITALIC');
//             }}
//           >
//             I
//           </button>
//           <button
//             className={isStyleActive('UNDERLINE') ? styles.activeButton : ''}
//             onMouseDown={(e) => {
//               e.preventDefault();
//               toggleInlineStyle('UNDERLINE');
//             }}
//           >
//             U
//           </button>
//           <button className={styles.addButton} onClick={handleSave}>
//             +
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// });

// export default DraftEditor;


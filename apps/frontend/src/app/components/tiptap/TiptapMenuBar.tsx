import { IonButton, IonIcon } from '@ionic/react';
import { Editor } from '@tiptap/react';

interface Props {
  editor: Editor;
}

export const TiptapMenuBar = (props: Props) => {
  const editor = props.editor;

  return (
    <>
      <IonButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        fill={editor.isActive('bold') ? 'solid' : 'clear'}
        size="small"
      >
        <IonIcon src={'/icons/bold.svg'} slot="icon-only" />
      </IonButton>
      <IonButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        fill={editor.isActive('italic') ? 'solid' : 'clear'}
        size="small"
      >
        <IonIcon src={'/icons/italic.svg'} slot="icon-only" />
      </IonButton>
      <IonButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        fill={editor.isActive('heading', { level: 1 }) ? 'solid' : 'clear'}
        size="small"
      >
        <IonIcon src={'/icons/h-1.svg'} slot="icon-only" />
      </IonButton>
      <IonButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        fill={editor.isActive('heading', { level: 2 }) ? 'solid' : 'clear'}
        size="small"
      >
        <IonIcon src={'/icons/h-2.svg'} slot="icon-only" />
      </IonButton>
      <IonButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        fill={editor.isActive('heading', { level: 3 }) ? 'solid' : 'clear'}
        size="small"
      >
        <IonIcon src={'/icons/h-3.svg'} slot="icon-only" />
      </IonButton>
      <IonButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
        fill={editor.isActive('heading', { level: 4 }) ? 'solid' : 'clear'}
        size="small"
      >
        <IonIcon src={'/icons/h-4.svg'} slot="icon-only" />
      </IonButton>
      <IonButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 5 }).run()}
        fill={editor.isActive('heading', { level: 5 }) ? 'solid' : 'clear'}
        size="small"
      >
        <IonIcon src={'/icons/h-5.svg'} slot="icon-only" />
      </IonButton>
      <IonButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        fill={editor.isActive('bulletList') ? 'solid' : 'clear'}
        size="small"
      >
        <IonIcon src={'/icons/list.svg'} slot="icon-only" />
      </IonButton>
      <IonButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        fill={editor.isActive('orderedList') ? 'solid' : 'clear'}
        size="small"
      >
        <IonIcon src={'/icons/list-numbers.svg'} slot="icon-only" />
      </IonButton>
      <IonButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        fill={editor.isActive('blockquote') ? 'solid' : 'clear'}
        size="small"
      >
        <IonIcon src={'/icons/blockquote.svg'} slot="icon-only" />
      </IonButton>
      <IonButton
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        fill="clear"
        size="small"
      >
        <IonIcon src={'/icons/separator-horizontal.svg'} slot="icon-only" />
      </IonButton>
    </>
  );
};

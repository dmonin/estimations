import { BulletList } from '@tiptap/extension-bullet-list';
import { Document } from '@tiptap/extension-document';
import { ListItem } from '@tiptap/extension-list-item';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import type { JSONContent } from '@tiptap/react';
import { EditorContent, useEditor } from '@tiptap/react';
import React, { useEffect, useState } from 'react';
import Mention from '@tiptap/extension-mention'
import suggestion from './suggestion';
import type { Editor } from '@tiptap/core';

import { HighlighterExtension } from './decorator';
import './style.css';


const EditorComponent: React.FC = () => {
  const [hourlyRate, setHourlyRate] = useState<number>(160);
  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      BulletList,
      ListItem,
      HighlighterExtension,
      Mention.configure({
        HTMLAttributes: {
          class: 'mention',
        },
        suggestion,
      })
    ],
    onUpdate: ({ editor }) => {
      update(editor);
    },
    content: '<ul><li>Start typing...</li></ul>',
  });

  useEffect(() => {
    const storedContent = localStorage.getItem('content');
    if (editor) {
      editor.commands.setContent(storedContent);
      update(editor);
    }
  }, [editor]);

  const [totalHours, setTotalHours] = useState<number>(0);
  const [byHashtag, setByHashtag] = useState<Record<string, number>>({});

  function update(editor: Editor) {
    const data = editor.getJSON();
    const hashtags = {};
    const result = calculateTotalHours(data, hashtags);
    setTotalHours(result);
    setByHashtag(hashtags);
    localStorage.setItem('content', editor.getHTML());
  }

  const calculateTotalHours = (data: JSONContent, hashtags: Record<string, number>): number => {
    let hours = 0;
    data.content?.forEach((node: JSONContent) => {
      if (node.type == 'text') {
        // matching hours
        let matches = node.text?.match(/(\d+(\.\d+)?h)/g);
        if (matches) {
          matches.forEach(match => {
            hours += parseFloat(match.slice(0, -1)); // remove the 'h' and convert to number
          });
        }

        matches = node.text?.match(/#\w+/g);
        if (matches) {
          matches.forEach(match => {
            if (!hashtags[match]) {
              hashtags[match] = 0;
            }
            hashtags[match] += hours;
          });
        }

      } else if (node.type == 'mention') {

        // matching hashtags
        const id = node.attrs?.id;

        if (!id || !hours) {
          return;
        }
        if (!hashtags[id]) {
          hashtags[id] = 0;
        }
        hashtags[id] += hours;
      } else {
        hours += calculateTotalHours(node, hashtags);
      }
    });

    return hours;
  };

  return (
    <div>
      {editor && <EditorContent editor={editor} /> }

      <div>
        <label>Hourly Rate</label>
        <input type='number' value={hourlyRate} min={0} max={1000} step={5} onChange={(e) => setHourlyRate(parseFloat(e.target.value))} />
      </div>
      <div>Total Hours: {totalHours}</div>
      <div>Total: {totalHours * hourlyRate} EUR</div>
      {Object.keys(byHashtag).map((hashtag) => {
        return <div key={hashtag}>{hashtag}: {byHashtag[hashtag]}h, {byHashtag[hashtag] * hourlyRate} EUR</div>;
      })}
    </div>
  );
}

export default EditorComponent;
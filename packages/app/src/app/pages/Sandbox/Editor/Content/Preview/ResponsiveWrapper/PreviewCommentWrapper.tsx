import {
  CommentWithRepliesFragment,
  PreviewReferenceMetadata,
} from 'app/graphql/types';
import { useOvermind } from 'app/overmind';
import * as React from 'react';
import { Icon } from '@codesandbox/components';
import styled from 'styled-components';

const BUBBLE_SIZE = 16;

const Wrapper = styled.div<{ showCommentCursor: boolean }>(props => ({
  height: '100%',
  position: 'relative',
  cursor: props.showCommentCursor
    ? `url('data:image/svg+xml;utf8,<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M0 8C0 3.58172 3.58172 0 8 0C12.4183 0 16 3.58172 16 8C16 12.4183 12.4183 16 8 16H0V8Z" fill="%23FF3B30"/></svg>'), auto`
    : 'inherit',
}));

const Screenshot = styled.div({
  position: 'absolute',
  left: 0,
  top: 0,
  zIndex: 1,
  color: '#FF3B30',
  width: 0,
  height: 0,
  backgroundSize: 'cover',
});

const PreviewBubble = styled(Icon)<{ active: boolean }>({
  position: 'absolute',
  width: BUBBLE_SIZE,
  height: BUBBLE_SIZE,
  color: '#FF3B30',
  zIndex: 2,
});

function getPreviewReference(
  comment: CommentWithRepliesFragment | null
): PreviewReferenceMetadata | null {
  if (
    comment &&
    comment.anchorReference &&
    comment.anchorReference.type === 'preview'
  ) {
    return comment.anchorReference.metadata as PreviewReferenceMetadata;
  }

  return null;
}

type Props = {
  children: any;
  scale: number;
};

export const PreviewCommentWrapper = ({ children, scale }: Props) => {
  const { state, actions } = useOvermind();
  const previewReference = getPreviewReference(state.comments.currentComment);

  const getScreenshotStyle = () => {
    if (
      state.preview.mode !== 'add-comment' &&
      state.preview.mode !== 'responsive-add-comment'
    ) {
      return {};
    }

    return state.preview.screenshot.source
      ? {
          backgroundImage: `url(${state.preview.screenshot.source})`,
          width: '100%',
          height: '100%',
        }
      : {
          backgroundColor: state.preview.screenshot.isLoading
            ? 'rgba(0,0,0,0.5)'
            : 'rgba(0,0,0,0)',
          width: '100%',
          height: '100%',
        };
  };

  return (
    <Wrapper
      showCommentCursor={
        !state.comments.currentComment &&
        Boolean(state.preview.screenshot.source)
      }
    >
      {children}
      <Screenshot
        style={getScreenshotStyle()}
        onClick={event => {
          if (state.preview.screenshot.isLoading) {
            return;
          }

          const parentBounds = (event.target as any).parentNode.getBoundingClientRect();

          actions.comments.addOptimisticPreviewComment({
            x: event.clientX - parentBounds.left,
            y: event.clientY - parentBounds.top,
            screenshot: state.preview.screenshot.source,
            scale,
          });
        }}
      />
      {previewReference &&
      (state.preview.mode === 'add-comment' ||
        state.preview.mode === 'responsive-add-comment') ? (
        <PreviewBubble
          id="preview-comment-bubble"
          name="comment"
          active
          style={{
            top: Math.round(previewReference.y) + 'px',
            left: Math.round(previewReference.x) + 'px',
          }}
        />
      ) : null}
    </Wrapper>
  );
};
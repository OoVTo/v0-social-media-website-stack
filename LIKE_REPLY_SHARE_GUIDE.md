# Like, Reply, and Quote Post Feature Implementation

## What's New

This implementation adds three major engagement features to your social media platform:

### 1. **Like Posts**
- Click the heart icon to like/unlike a post
- Heart fills with color when liked
- Like count updates in real-time
- Each user can only like a post once

### 2. **Reply to Posts**
- Click "Reply" button to expand reply section
- Type your reply and submit
- Replies appear below the post in chronological order
- Delete your own replies with the X button
- Supports nested conversations under each post

### 3. **Quote Post (Share)**
- Click "Share" button to open quote post modal
- Add your own comment to the original post
- Creates a new post in your feed with reference to original
- Shows the original post preview in your quote post
- Other users can see which post you quoted

## Database Setup

### Step 1: Run Migration Script

Execute `scripts/05-add-comments-and-shares.sql` in your Supabase SQL Editor:

```sql
-- Creates:
-- - comments table for post replies
-- - shared_post_id column on posts table
-- - RLS policies for comments
-- - Indexes for performance
```

This script:
- Creates `comments` table
- Adds `shared_post_id` column to `posts` table
- Sets up RLS policies for comments
- Creates database indexes

### Step 2: Verify Tables

After running the migration, check that you have:
- `comments` table with columns: id, post_id, user_id, content, created_at, updated_at
- `posts` table now has `shared_post_id` column

## How It Works

### Liking a Post
```
1. User clicks heart icon
2. Frontend checks if already liked
3. If liked: removes from likes table, decreases count
4. If not liked: adds to likes table, increases count
5. Heart fills/empties with animation
6. Like count updates
```

### Replying to a Post
```
1. User clicks "Reply" button
2. Reply input section expands
3. User types reply text
4. Click "Reply" button to submit
5. Reply is inserted into comments table
6. Reply appears immediately in the thread
7. User can delete their own replies
```

### Quote Posting
```
1. User clicks "Share" button
2. Modal opens showing original post preview
3. User types their comment
4. Click "Quote Post" button
5. New post is created with:
   - User's comment as content
   - shared_post_id pointing to original post
   - User's ID as creator
6. Post appears in their feed as a regular post
```

## Component Structure

### PostCard Component
- **State Variables:**
  - `isLiked` - whether current user has liked this post
  - `likeCount` - total number of likes
  - `showReplies` - whether reply section is expanded
  - `replies` - array of comments/replies
  - `replyText` - text input for new reply
  - `showShareModal` - whether share modal is open
  - `shareText` - text input for quote post

- **Functions:**
  - `handleLike()` - toggle like state
  - `fetchReplies()` - load comments for this post
  - `handleReply()` - submit new reply
  - `handleShare()` - create quote post
  - `handleDeleteReply()` - remove a reply

### Database Queries
```
GET likes:
  SELECT * FROM likes 
  WHERE post_id = ? AND user_id = ?

INSERT like:
  INSERT INTO likes (post_id, user_id) VALUES (?, ?)

DELETE like:
  DELETE FROM likes WHERE post_id = ? AND user_id = ?

GET comments:
  SELECT * FROM comments 
  WHERE post_id = ? 
  ORDER BY created_at ASC

INSERT comment:
  INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)

DELETE comment:
  DELETE FROM comments WHERE id = ?

CREATE quote post:
  INSERT INTO posts (user_id, content, shared_post_id, media_urls) 
  VALUES (?, ?, ?, NULL)
```

## UI/UX Features

### Like Button
```
Normal: ♡ [count]
Liked:  ❤ [count] (in red)
```

### Reply Section
- Expandable/collapsible
- Textarea for reply input
- "Reply" button (disabled when empty)
- List of existing replies
- Delete button for own replies

### Share Modal
- Shows original post preview
- Textarea for adding comment
- Cancel and Quote Post buttons
- Overlay background for focus

## Security (RLS Policies)

```sql
-- Anyone can view comments
SELECT: true

-- Users can create comments on any post
INSERT: auth.uid() = user_id OR true

-- Users can only delete own comments
DELETE: auth.uid() = user_id
```

## Testing Checklist

- [ ] Like a post - heart should fill
- [ ] Like again - heart should empty, count decreases
- [ ] Click Reply - section should expand
- [ ] Type a reply and submit - reply appears below
- [ ] Delete your reply - it disappears
- [ ] Click Share - modal opens with original post preview
- [ ] Type comment and quote post - new post appears in feed
- [ ] Check like status persists on page refresh
- [ ] Multiple users can like same post independently
- [ ] Users can't delete other users' replies

## Troubleshooting

### Replies Not Showing
- Check that comments table exists in Supabase
- Verify RLS policies are enabled
- Check browser console for SQL errors
- Ensure user_id is being set correctly

### Like Count Not Updating
- Verify likes table exists
- Check user authentication is working
- Look for RLS policy errors in console

### Share Modal Not Working
- Confirm shared_post_id column exists on posts
- Check that user is authenticated
- Verify shares are being inserted into posts table

### Comments Not Being Saved
- Run migration script (05-add-comments-and-shares.sql)
- Verify comments table RLS policies
- Check user authentication status

## Future Enhancements

- Nested replies (replies to replies)
- Edit comments
- Mention users in replies (@username)
- Reactions beyond likes (emoji reactions)
- Comment counts visible in feed
- Quote post indicators showing original post link
- Like/comment notifications
- Real-time updates with Supabase subscriptions

import { sendEmail } from '@/lib/email';

async function testEmail() {
  try {
    // Test new comment notification
    console.log('Testing new comment notification...');
    await sendEmail(
      'test@example.com',
      'newCommentNotification',
      {
        postTitle: 'Test Post',
        postUrl: 'https://example.com/blog/test-post',
        authorName: 'Test User',
        content: 'This is a test comment',
        commentUrl: 'https://example.com/admin/comments/123',
      }
    );
    console.log('New comment notification sent successfully!');

    // Test comment reply notification
    console.log('\nTesting comment reply notification...');
    await sendEmail(
      'test@example.com',
      'commentReplyNotification',
      {
        postTitle: 'Test Post',
        postUrl: 'https://example.com/blog/test-post',
        authorName: 'Test User',
        content: 'This is the original comment',
        replyContent: 'This is a reply to your comment',
        commentUrl: 'https://example.com/blog/test-post#comment-123',
      }
    );
    console.log('Comment reply notification sent successfully!');

  } catch (error) {
    console.error('Error testing email:', error);
    process.exit(1);
  }
}

testEmail();

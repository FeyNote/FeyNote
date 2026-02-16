---
title: Sharing Documents
description: Share documents with others by inviting specific users or creating a public link.
---

FeyNote's sharing features let you collaborate with others on your documents. There are two ways to share: you can invite specific users by their email address, or you can create a public link that anyone can use to view your document. Each person you share with gets an access level that controls what they can do.

## Access Levels

Every shared user has one of the following access levels:

- **Co-Owner** has full control over the document, including the ability to manage sharing settings. You (the document creator) are always a co-owner. At the current moment, you cannot give others this role.
- **Read & Write** lets someone edit the document alongside you, but they can't change who else has access.
- **Read Only** lets someone view the document but not make any changes.

When you share with someone, you choose between Read & Write and Read Only. To remove someone's access entirely, you can set their level to **No Access**.

## Sharing with Specific Users

To share a document, open the right sidebar while viewing the document you'd like to share and click **Manage Sharing** at the bottom of the "Shared With" card. This opens the sharing dialog, where you'll find three ways to add or manage users:

- **Users With Access** shows everyone who currently has access to this document. You can change any user's access level from the dropdown next to their name, or set it to No Access to revoke their access.
- **Users You've Shared With Previously** shows people you've shared other documents with in the past, making it easy to re-share without searching. Just pick an access level to give them access to this document.
- **Add a New User** lets you search by email address to find someone on FeyNote and give them access. If they don't have an account yet, they'll need to register for one first.

## Sharing via Link

From the [sharing dialog](#sharing-with-specific-users), you can also enable a public link for your document. When you set the link access level to **Read Only**, anyone with the link can view your document without needing to be individually invited.

A share URL will appear that you can copy and send through whatever platform you prefer. To turn off link sharing, set the link access level back to No Access.

## Finding Shared Content

Documents that others have shared with you show up in two places:

- The **Shared With You** card on the dashboard shows your most recently updated shared documents.
- The **Shared Content** page (accessible by expanding the dashboard card) gives you a full list of every document that's been shared with you, along with who shared it.

## Removing Yourself from a Shared Document

If someone has shared a document with you and you no longer need access, you can remove yourself. Open the right sidebar and click **Remove My Access** in the "Shared Document" section. This removes the document from your collection. The owner can always re-add you later if needed.

## Sharing Multiple Documents at Once

If you need to update sharing settings across several documents, the All Documents page makes this easy. Select the documents you want to update, then choose **Manage Sharing** from the **Actions** dropdown. From there you can add, change, or remove access for users across all selected documents in one step.

## Sharing and References

When you create a [reference](/docs/documents/references) to a document that has different sharing settings than the one you're editing, FeyNote will let you know and offer options to bring them in sync. This helps avoid situations where a collaborator can see one document but not the other.

Depending on the differences, you may be offered options to:

- Update the link access level so both documents match
- Share the referenced document with users who have access to your current document
- Share your current document with users who have access to the referenced document
- Apply all of the above at once

You can also choose to leave things as they are if the difference is intentional.

### Creating New Documents via References

When you create a new document through the [reference menu](/docs/documents/references#creating-new-documents-from-the-reference-menu), you can choose whether the new document should inherit the current document's sharing settings. This is controlled by a preference in [your editor settings](/docs/settings/general#reference-sharing-behavior) with three options:

- **Always copy sharing settings** from the current document
- **Never copy sharing settings** (the new document starts unshared)
- **Always ask me** (the default) so you can decide each time

When you reference an existing document that has different sharing settings, FeyNote will prompt you to bring them in sync (as described [above](#sharing-and-references)). If you'd rather not see this prompt, you can turn it off in [your editor settings](/docs/settings/general#reference-sharing-behavior).

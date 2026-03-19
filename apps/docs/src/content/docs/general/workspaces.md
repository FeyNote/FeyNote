---
title: Workspaces
description: Group your documents into collections, keep them organized with a tree, and share entire collections with collaborators.
---

Workspaces let you group related documents together into their own self-contained collections. Each workspace has a name, an icon, and a color, making it easy to tell them apart at a glance. You can use workspaces to keep different projects, worlds, or topics separate. You can share an entire workspace with others so they get access to the whole collection at once.

By default, FeyNote shows all of your documents together in a view called **Everything**. Workspaces let you carve that into smaller, focused collections. You can switch between workspaces at any time, and anything you do (browsing, searching, organizing) is scoped to whichever workspace you have active. Assistant threads can also belong to workspaces, so your conversations stay organized alongside the documents they relate to.

## The Workspace Picker

The workspace picker sits at the top of the left sidebar. It shows the name of your currently active workspace, or **Everything** if you don't have one selected. Click it to open a dropdown with all of your workspaces, including any shared workspaces you've accepted.

Each workspace in the list shows its icon and color so you can identify them quickly. From the dropdown you can:

- Click any workspace to switch to it.
- Click **Everything** to go back to seeing all of your documents across every workspace.
- Click **Create Workspace** at the bottom to set up a new one.

Each workspace in the list also has a small pencil button. If you own the workspace, clicking this opens the [edit dialog](#editing-a-workspace). If someone else shared the workspace with you, it opens an [information view](#viewing-shared-workspace-info) instead.

FeyNote remembers which workspace you had open the last time you used the app, so you'll pick up right where you left off.

## Creating a Workspace

To create a workspace, click **Create Workspace** at the bottom of the workspace picker dropdown. A dialog appears where you can set up your new workspace with three options:

- **Name**: give your workspace a name. This is the only required field.
- **Icon**: pick from a variety icons to represent your workspace.
- **Color**: choose from a variety of colors to give your workspace a distinct look in the picker and in the tree.

You can also set up [sharing](#sharing-a-workspace) right away from this same dialog if you'd like to invite collaborators or share a link to the workspace from the start.

## What Changes When a Workspace Is Active

Selecting a workspace focuses your entire FeyNote experience on that collection. Everything you see and do is scoped to the documents and threads inside it:

- **Dashboard** shows only recent documents and threads from this workspace.
- **Tree** shows the workspace's own document tree, which you can organize independently from your main tree or other workspaces.
- **All Documents** lists only documents in this workspace.
- **Search** searches within this workspace's documents.
- **Graph** shows the relationship graph for this workspace's documents only.

Switching back to **Everything** returns you to the full, unfiltered view with all of your documents and threads across every workspace.

Notably if you have tabs or panes from **Everything** or another workspace open when you switch to a different workspace, those tabs and panes will remain. This allows you to do work across workspaces if you so choose.

By default, when you search for artifacts and blocks (either via the global search, or when creating a reference), the results are scoped to the active workspace. If you'd rather search across all workspaces regardless of which one is active, you can change this in [settings](#settings).

## Adding Documents to a Workspace

There are several ways to bring documents into a workspace.

### Creating New Documents

When you create a new document while a workspace is active, FeyNote will ask whether you'd like to add it to the current workspace. You'll see four options:

- **Yes** adds the document to the workspace this time.
- **No** skips adding it this time.
- **Always** tells FeyNote to automatically add new documents to the active workspace from now on, without asking.
- **Never** tells FeyNote to stop asking and never add new documents automatically.

You can change this preference later in [settings](#settings) under **Add new items to active workspace**.

If the workspace is shared with other people, FeyNote will also ask whether you'd like to share the new document with those same people. This is covered in more detail under [How Workspace Sharing Interacts with Documents](#how-workspace-sharing-interacts-with-documents).

### Adding Existing Documents

To add a document that already exists (you must also own it), right-click it in the tree or open the dropdown menu in the top right corner of the document view and choose **Add to Workspace**. A workspace picker dialog will appear showing all of the workspaces you have edit access to. Click the one you want and confirm.

If you're adding the document to a shared workspace, FeyNote will ask whether you'd like to update the document's sharing settings to match the workspace. You can choose to apply the workspace's sharing, skip it, or set a preference to always or never apply sharing automatically.

You can also add documents to workspaces in bulk from the [All Documents](/docs/general/all-documents) page. Select the documents you want to add, then choose **Add to Workspace** from the **Actions** dropdown.

### Moving Documents Between Workspaces

If a document is already in one workspace and you'd like to move it to another, right-click it in the tree or via the menu in the top right corner of the document view and choose **Move to Workspace**. This removes it from the current workspace and adds it to the one you select. The document itself isn't affected - it just changes which collection it belongs to.

You can also move documents between workspaces in bulk from the [All Documents](/docs/general/all-documents) page. Select the documents you want to move, then choose **Move to Workspace** from the **Actions** dropdown.

## Removing Documents from a Workspace

To remove a document from a workspace, right-click it and choose **Remove from Workspace**. This takes the document out of the workspace collection, but does not delete it. The document will still appear in the document owner's **Everything** view as well as in any other workspaces it belongs to.

You can also remove documents in bulk from the [All Documents](/docs/general/all-documents) page. Select the documents you want to remove, then choose **Remove from Workspace** from the **Actions** dropdown.

## Organizing the Workspace Tree

Each workspace has its own independent tree structure, separate from your main tree and from other workspaces. This means you can organize the same documents differently depending on the context. For example, a document might sit at the top level in one workspace but be nested deeply in another.

When a workspace is active, the left sidebar shows that workspace's tree. You can drag and drop documents to rearrange them, nest documents inside each other, and build whatever structure makes sense for that collection. For more on how the tree works, see [Document Tree](/docs/documents/tree).

Collaborators will see the same tree structure (unlike your personal tree within the **Everything** collection). This makes workspaces particularly powerful for sharing and organizing shared knowledge between members where you want to maintain a hierarchy.

### How the Workspace Tree Works for Shared Members

All members of the workspace will only see items within the tree that they have at least read access to (including the owner). This fact can be used hide information from certain participants or keep specific articles of information hidden from everyone else even while it exists within the workspace hierarchy.

If an item you cannot see has tree items that you _can_ see nested within it, you'll see the text "Hidden Document" displayed on the parent item, and it will be inaccessible.

## Editing Workspace Settings

To edit the settings for a workspace that you own, click the pencil icon next to it in the workspace picker. The edit dialog lets you change the workspace's name, icon, and color. These changes are saved automatically and show up in real time for anyone you've shared the workspace with.

From this same dialog, you can manage [sharing](#sharing-a-workspace) and [delete the workspace](#deleting-a-workspace).

Only the workspace owner can edit these settings. If you're a collaborator on someone else's workspace, the pencil icon opens a [read-only information view](#viewing-shared-workspace-info) instead.

## Deleting a Workspace

To delete a workspace, open the [edit dialog](#editing-a-workspace) and click **Delete Workspace**. A confirmation dialog will appear to make sure you want to proceed.

Deleting a workspace does not delete any of the documents or threads inside it. Each document or thread will remain in the associated owner's collection and can still be found in the **Everything** view or in any other workspaces they belong to. When deleted, the workspace simply stops being a grouping for those items.

## Sharing a Workspace

Sharing a workspace lets you collaborate with others on an entire collection of documents, rather than [sharing documents](/docs/documents/sharing) one at a time. When you share a workspace, your collaborators can see the workspace in their picker, browse/edit its tree, and work with documents inside it based on the access level you give them (documents retain their own permission levels).

### Access Levels

Workspace access levels work the same way as [document access levels](/docs/documents/sharing#access-levels):

- **Co-Owner** has full control over the workspace, including the ability to edit the workspace name, icon, and color, and manage who else has access. You (the workspace creator) are always a co-owner.
- **Read & Write** lets someone add new documents, and organize the tree. They cannot change the workspace's name, icon, or color, and they cannot manage sharing settings. Sharing a workspace as read & write does not automatically grant access to documents within the workspace, but adjusting sharing permissions on the workspace will prompt the owner whether they'd like to apply the same permissions for the workspace to all documents that they own within the workspace.
- **Read Only** lets someone browse the workspace tree, but not make edits. If they try to create a document while a read-only workspace is active, FeyNote will let them know they don't have edit access. Sharing a workspace as read only does not automatically grant access to documents within the workspace, but adjusting sharing permissions on the workspace will prompt the owner whether they'd like to apply the same permissions for the workspace to all documents that they own within the workspace.
- **No Access** removes someone's access to the workspace entirely. It does not automatically remove their access to the documents contained within the workspace unless the owner chooses to do so.

### Adding People

To share a workspace, as the owner open the workspace [creation](#creating-a-workspace) or [edit](#editing-a-workspace) dialog. Search for a user by their email address, then choose an access level for them. If they don't have a FeyNote account yet, they'll need to sign up first before you can add them.

If the workspace already contains documents, FeyNote will ask whether you'd like to apply the sharing change to all of those documents right now, or only to documents added going forward:

- **Apply to all** updates every document currently in the workspace (that you own) to match the new sharing settings.
- **Only going forward** leaves existing documents as they are and only applies the settings to documents added to the workspace from now on (you will see a prompt when adding documents).

### Changing or Removing Access

To change or remove access to a workspace, as the owner open the workspace [creation](#creating-a-workspace) or [edit](#editing-a-workspace) dialog.

All current members of the workspace are listed in the sharing panel with their access level. To change someone's access, pick a new level from the dropdown next to their name. To remove someone entirely, set their level to **No Access**.

As with adding people, FeyNote will ask whether to apply the change to all existing documents or only going forward.

### Sharing via Link

To adjust link sharing settings for a workspace, as the owner open the workspace [creation](#creating-a-workspace) or [edit](#editing-a-workspace) dialog.

Here, you'll find a section called **Public Access via Link**. You can enable a public link for your workspace by setting the link access level to **Read Only**.

When link sharing is enabled, a URL appears that you can copy and share however you like. Anyone who opens the link can browse the workspace's tree and graph. Documents within the workspace are shared individually, so the link gives access to the workspace structure but each document's own sharing settings still apply.

To turn off link sharing, set the link access level back to **No Access**.

When you change the link access level, FeyNote will ask whether to apply the change to all documents currently in the workspace or only going forward, just like when adding individual users.

### The Workspace Share View

When someone opens a workspace share link, they see a dedicated view with the workspace's contents laid out for browsing:

- A sidebar on the left shows the workspace's name, icon, and a browsable list of its documents.
- The main area on the right displays whichever document is currently selected.

They can click through documents in the sidebar to read them. What they can do depends on the access level for each document, as well as the access level for the associated workspace.

## How Workspace Sharing Interacts with Documents

Sharing a workspace does not automatically share all of its documents. You have explicit control over this, which means you can have a shared workspace where some documents are visible to everyone and others remain private to you.

Here's how the interaction works in practice:

- **When you add a document to a shared workspace**, FeyNote asks whether you'd like to update the document's sharing settings to match the workspace's. You can choose **Yes** to apply the workspace's sharing, **No** to leave the document's sharing as-is, **Always** to stop being asked and always apply sharing, or **Never** to stop being asked and never apply sharing.
- **When you change workspace sharing settings** (adding or removing members, changing access levels, or updating link sharing), FeyNote asks whether to apply the change to all documents currently in the workspace, or only to documents added going forward.

You can change the "share documents with workspace members when adding" preference at any time in [settings](#settings) under **Share documents with workspace members when adding**.

## Receiving a Shared Workspace

### The Inbox

When someone shares a workspace with you, it appears in your **Inbox**, which you can find in the left sidebar.

In the inbox, you have two options when viewing an incoming workspace share request:

- **Accept** adds the workspace to your workspace picker so you can start using it.
- **Decline** dismisses the invitation and removes your access.

### What You See After Accepting

Once you accept a shared workspace, it appears in your workspace picker dropdown alongside your own workspaces. Selecting it works just like selecting one of your own: your dashboard, tree, documents, search, and graph all scope to that workspace's contents.

What you can do inside the workspace depends on the access level the owner gave you:

- With **Read & Write** access, you can add new documents to the workspace, and organize the tree. Read & write access to the workspace does not inherently give you access to all documents within. Owners of documents within the workspace will need to give you access, though there are convenient prompts that show up for authors so many times document sharing settings will match the sharing level of the workspace.
- With **Read Only** access, you cannot edit the workspace tree or add documents to the workspace. If you try to create a document while a read-only workspace is active, FeyNote will let you know that you don't have edit access.

### Accepting Documents into a Workspace

When someone shares an individual document with you (rather than a workspace), the inbox shows it in the **Documents** section. Along with the usual **Accept** and **Decline** buttons, you'll also see **Accept & Add to Workspace** if you have any editable workspaces. This lets you accept the shared document and immediately place it into one of your workspaces in a single step.

## Viewing Shared Workspace Info

If you're a collaborator on a workspace (not the owner), clicking the pencil icon in the workspace picker opens an information view rather than the edit dialog. Here you can see:

- The workspace's icon, color, and name.
- Who owns the workspace.
- Your access level (read-only or read and write).

From this view you can also choose to [leave the workspace](#leaving-a-shared-workspace).

## Leaving a Shared Workspace

If you no longer want to be part of a shared workspace, you can leave it. Open the [workspace info view](#viewing-shared-workspace-info) and click **Leave Workspace**. A confirmation dialog will let you know that you'll lose access unless you're re-invited.

After leaving, the workspace is removed from your workspace picker. The workspace owner can always re-add you later if needed.

This does not revoke your access to individual documents within the workspace. They will remain in your **Everything** collection. You can revoke your access to each document within the workspace if desired.

## Workspaces in the Right Sidebar

When viewing a document, the right sidebar includes a **Workspaces** section that shows which workspaces the document belongs to. Each workspace is listed with its icon and name. If the document isn't in any workspace, this section shows "Not in any workspace". This gives you a quick way to see how a document fits into your collections without switching between workspaces to check.

## Real-Time Collaboration

All workspace changes happen in real time. When a collaborator renames the workspace, changes its icon or color, adds a document, or reorganizes the tree, you'll see the update immediately without needing to refresh. If the workspace owner changes your access level, your permissions update right away as well.

## Settings

Several workspace-related settings are available in the editor settings section of the [settings page](/docs/settings/general). These let you control the default behavior for common workspace interactions:

- **Add new items to active workspace** controls whether new documents and threads are automatically added to the active workspace. You can choose **Always**, **Never**, or **Ask Me** (the default). This is the same preference that the Yes/No/Always/Never prompt sets when you [create a new document](#creating-new-documents) in a workspace.
- **Share documents with workspace members when adding** controls whether documents are automatically shared with workspace members when you add them to a shared workspace. You can choose **Always**, **Never**, or **Ask Me** (the default). This is the same preference that the sharing prompt sets when you [add a document](#adding-existing-documents) to a shared workspace.
- **Search all workspaces for references** controls whether the [reference](/docs/documents/references) search looks across all of your workspaces or only the active one. Turn this on if you frequently reference documents that live in different workspaces.
- **Search all workspaces in global search** controls whether [search](/docs/general/search) looks across all of your workspaces or only the active one. Turn this on if you want search results from every workspace regardless of which one you're currently viewing.

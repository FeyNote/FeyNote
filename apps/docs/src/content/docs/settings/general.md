---
title: Settings
description: Customize FeyNote's interface, editor behavior, and account options.
---

The settings page is where you make FeyNote feel like yours. You can tweak how the app looks, how the editor behaves, and manage your account.

To get to the settings page, click the settings button at the bottom of the [left side menu](/docs/general/layout/desktop-panes#left-side-menu).

## Help

At the top of the settings page you'll find a few handy links:

- **Documentation** brings you to this documentation site.
- **Contact Support (Discord)** takes you to the FeyNote Discord server, where you can ask questions, share feedback, or report bugs.
- **Download Debug File** creates a small encrypted file with diagnostic information. If you ever run into a problem and need help from us, this file makes it much easier for us to figure out what went wrong. You can optionally include your documents and folder tree in the download if the issue involves your content (we may ask you to do this).

## Account Settings

This section shows which email you're signed in with and gives you a few ways to manage your account.

### Importing and Exporting

If you're coming from another note-taking app, **Import Document Data** lets you bring your existing notes into FeyNote. You can see some of the supported formats in the import category in the left sidebar of the documentation.

If you'd like to back up your content, or move to another note taking app, **Export Document Data** downloads all your documents in a portable format.

### Syncing Preferences Across Devices

If you use FeyNote on more than one device, turning on **Sync Preferences Between Devices** keeps your settings consistent everywhere. The first time you enable this, FeyNote will ask whether you'd like to keep the settings on this device or use the ones already saved in the cloud, so nothing gets overwritten by surprise.

### Changing Your Email or Password

The **Change account email** and **Change account password** buttons each send a verification email to your current address with a secure link. This extra step keeps your account safe in case someone else has access to your device.

One thing to note: if you signed up using Google and haven't set a password yet, you'll need to set one before you can change your email address.

## Interface Settings

This is where you control how FeyNote looks and feels day to day.

### Side Menus

FeyNote has a left menu for navigation and a right menu for context-specific options. You can decide how these behave when you open the app:

- **Remember left & right menu open between restarts** will restore whichever menus you had open last time, so your workspace picks up right where you left off.
- **Start with left menu open** and **Start with right menu open** let you choose to always start with a specific menu open (or closed). They're ignored when "remember" is turned on, since that takes priority.

### Document Tree

The left side menu can show a tree view of all your documents, which is a great way to browse your world, campaign, or project at a glance.

- **Show document tree in left menu** toggles the tree on or off.
- **Automatically reveal documents within tree** means that when you open a document, the tree will scroll and expand to show where it lives. This is handy for staying oriented in a large collection.
- **Show uncategorized documents section in document tree** adds a section at the bottom of the tree for any documents that haven't been organized into a folder yet. Useful for finding loose notes that need a home.

### AI Threads

**Show recent AI threads in left menu** adds a list of your recent AI conversations to the left side menu for quick reference.

### Language

Choose from any of the supported languages, or leave it set to **Browser Default** to match whatever language your browser is using.

### Theme

Pick between **Light**, **Dark**, or **System Default**. System Default follows your operating system's preference, so if your OS switches between light and dark mode automatically, FeyNote match that.

### Font Size

If the default text size doesn't meet your needs, you can adjust it here. This affects the entire app, not just the editor. This affects the way that you see content only, and does not affect what other users see.

## Editor Settings

These options shape how the text editor behaves when you're writing and collaborating.

### Reference Sharing Behavior

When you link documents together using [references](/docs/documents/references), those documents might have different [sharing settings](/docs/documents/sharing). For example, you might reference a shared monster statblock from a private session notes page. FeyNote can help you keep things in sync so your collaborators can see everything they need to.

Two settings control this:

- **Default sharing behavior when creating a new document via reference** controls what happens when you create a brand new document through the reference menu. You can choose to always copy the current document's sharing settings to the new one, never copy them, or be asked each time. "Always Ask Me" is the default and recommended setting here.
- **Default sharing behavior when creating a reference to an existing document** controls what happens when you reference a document that already exists and has different sharing settings. You can choose to be prompted about the mismatch or skip the prompt entirely.

### Collaboration Cursor Color

When you're working on a document with someone else in real time, each person's cursor shows up in a different color so you can tell who's editing where. You can pick a color that suits you, or leave it on **Random Color** and let FeyNote assign one.

"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/contexts/AuthContext";

interface Note {
  id: string;
  agency_id: number;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

interface NotesSectionProps {
  agencyId: number;
}

export default function NotesSection({ agencyId }: NotesSectionProps) {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  // Load notes for this agency and current user
  const loadNotes = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("agency_notes")
        .select("*")
        .eq("agency_id", agencyId)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setNotes(data || []);
    } catch (err) {
      console.error("Error loading notes:", err);
      setError("Failed to load notes");
    } finally {
      setIsLoading(false);
    }
  };

  // Save new note
  const saveNote = async () => {
    if (!user || !newNote.trim()) return;

    try {
      setIsSaving(true);
      setError(null);

      const { data, error } = await supabase
        .from("agency_notes")
        .insert({
          agency_id: agencyId,
          user_id: user.id,
          content: newNote.trim(),
        })
        .select()
        .single();

      if (error) throw error;

      setNotes([data, ...notes]);
      setNewNote("");
    } catch (err) {
      console.error("Error saving note:", err);
      setError("Failed to save note");
    } finally {
      setIsSaving(false);
    }
  };

  // Delete note
  const deleteNote = async (noteId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("agency_notes")
        .delete()
        .eq("id", noteId)
        .eq("user_id", user.id); // Ensure user can only delete their own notes

      if (error) throw error;

      setNotes(notes.filter(note => note.id !== noteId));
    } catch (err) {
      console.error("Error deleting note:", err);
      setError("Failed to delete note");
    }
  };

  // Update note
  const updateNote = async (noteId: string, newContent: string) => {
    if (!user || !newContent.trim()) return;

    try {
      const { error } = await supabase
        .from("agency_notes")
        .update({ 
          content: newContent.trim(),
          updated_at: new Date().toISOString()
        })
        .eq("id", noteId)
        .eq("user_id", user.id); // Ensure user can only update their own notes

      if (error) throw error;

      setNotes(notes.map(note => 
        note.id === noteId 
          ? { ...note, content: newContent.trim(), updated_at: new Date().toISOString() }
          : note
      ));
    } catch (err) {
      console.error("Error updating note:", err);
      setError("Failed to update note");
    }
  };

  useEffect(() => {
    if (user) {
      loadNotes();
    }
  }, [user, agencyId]);

  // Don't render if user is not logged in
  if (!user) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
          <span className="text-yellow-600">📝</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-800">My Notes</h2>
      </div>

      {/* Add new note */}
      <div className="mb-6">
        <div className="flex gap-3">
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Add a note about this agency..."
            className="flex-1 p-3 border border-slate-300 rounded-lg resize-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            rows={3}
            disabled={isSaving}
          />
          <button
            onClick={saveNote}
            disabled={!newNote.trim() || isSaving}
            className="px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200 font-medium"
          >
            {isSaving ? "Saving..." : "Add Note"}
          </button>
        </div>
        {error && (
          <p className="text-red-500 text-sm mt-2">{error}</p>
        )}
      </div>

      {/* Notes list */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
          <span className="ml-3 text-slate-600">Loading notes...</span>
        </div>
      ) : notes.length === 0 ? (
        <div className="text-center py-8 text-slate-500">
          <div className="text-4xl mb-2">📝</div>
          <p>No notes yet. Add your first note above!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notes.map((note) => (
            <NoteItem
              key={note.id}
              note={note}
              onUpdate={updateNote}
              onDelete={deleteNote}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Individual note component
function NoteItem({ 
  note, 
  onUpdate, 
  onDelete 
}: { 
  note: Note; 
  onUpdate: (id: string, content: string) => void;
  onDelete: (id: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(note.content);

  const handleSave = () => {
    if (editContent.trim() && editContent !== note.content) {
      onUpdate(note.id, editContent);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditContent(note.content);
    setIsEditing(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs text-slate-500">
          {formatDate(note.updated_at || note.created_at)}
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="text-slate-500 hover:text-slate-700 text-sm"
          >
            {isEditing ? "Cancel" : "Edit"}
          </button>
          <button
            onClick={() => onDelete(note.id)}
            className="text-red-500 hover:text-red-700 text-sm"
          >
            Delete
          </button>
        </div>
      </div>
      
      {isEditing ? (
        <div className="space-y-3">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            rows={3}
          />
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700"
            >
              Save
            </button>
            <button
              onClick={handleCancel}
              className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <p className="text-slate-700 whitespace-pre-wrap">{note.content}</p>
      )}
    </div>
  );
}

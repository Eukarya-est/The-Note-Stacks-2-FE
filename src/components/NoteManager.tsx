/**
 * NoteManager Component
 * 
 * Example component demonstrating how to use the Go backend API
 * This shows CRUD operations with the new backend system
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  useNotesByStack, 
  useCreateNote, 
  useUpdateNote, 
  useDeleteNote,
  useHealthCheck 
} from "@/hooks/useNotes";
import { Loader2, Trash2, Edit, Plus, CheckCircle2, XCircle } from "lucide-react";

interface NoteManagerProps {
  stackId: string;
}

const NoteManager = ({ stackId }: NoteManagerProps) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  // Fetch notes for the current stack
  const { data: notes = [], isLoading, error } = useNotesByStack(stackId);
  
  // Check backend health
  const { data: health } = useHealthCheck();
  
  // Mutations
  const createNote = useCreateNote();
  const updateNote = useUpdateNote();
  const deleteNote = useDeleteNote();

  // Handle create or update
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !content) return;

    if (editingId) {
      // Update existing note
      updateNote.mutate(
        { 
          id: editingId, 
          updates: { title, content, cover: stackId } 
        },
        {
          onSuccess: () => {
            setTitle("");
            setContent("");
            setEditingId(null);
          }
        }
      );
    } else {
      // Create new note
      createNote.mutate(
        { title, content, cover: stackId },
        {
          onSuccess: () => {
            setTitle("");
            setContent("");
          }
        }
      );
    }
  };

  // Handle edit
  const handleEdit = (note: any) => {
    setTitle(note.title);
    setContent(note.content);
    setEditingId(note.id);
  };

  // Handle cancel edit
  const handleCancel = () => {
    setTitle("");
    setContent("");
    setEditingId(null);
  };

  // Handle delete
  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this note?")) {
      deleteNote.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
        Error loading notes: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Backend Health Status */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-muted-foreground">Backend Status:</span>
        {health ? (
          <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
            <CheckCircle2 className="h-4 w-4" />
            <span>Connected</span>
          </div>
        ) : (
          <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
            <XCircle className="h-4 w-4" />
            <span>Disconnected</span>
          </div>
        )}
      </div>

      {/* Create/Edit Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {editingId ? <Edit className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
            {editingId ? "Edit Note" : "Create New Note"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                placeholder="Note Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div>
              <Textarea
                placeholder="Note Content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
                required
              />
            </div>
            <div className="flex gap-2">
              <Button 
                type="submit" 
                disabled={createNote.isPending || updateNote.isPending}
              >
                {(createNote.isPending || updateNote.isPending) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {editingId ? "Update" : "Create"}
              </Button>
              {editingId && (
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Notes List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">
          Notes in Stack ({notes.length})
        </h3>
        {notes.length === 0 ? (
          <p className="text-muted-foreground">No notes yet. Create one above!</p>
        ) : (
          <div className="grid gap-4">
            {notes.map((note) => (
              <Card key={note.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{note.title}</span>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(note)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(note.id)}
                        disabled={deleteNote.isPending}
                      >
                        {deleteNote.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {note.content}
                  </p>
                  <div className="mt-4 text-xs text-muted-foreground">
                    Created: {new Date(note.createdAt).toLocaleString()}
                    {note.updatedAt !== note.createdAt && (
                      <> • Updated: {new Date(note.updatedAt).toLocaleString()}</>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NoteManager;

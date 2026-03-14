/**
 * BackendDemo Page
 * 
 * Demo page showing how to use the Go backend API
 * Access this page at /backend-demo
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import NoteManager from "@/components/NoteManager";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, Database } from "lucide-react";

const BackendDemo = () => {
  const navigate = useNavigate();
  const [stackId, setStackId] = useState("stack-1");

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </div>

        {/* Title Card */}
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Database className="h-6 w-6" />
              Go Backend Demo
            </CardTitle>
            <CardDescription className="text-base">
              This page demonstrates the connection to the Go + Redis backend system.
              All operations (Create, Read, Update, Delete) are performed via the REST API.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* API Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>API Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Backend URL:</span>
                <code className="ml-2 px-2 py-1 bg-muted rounded">
                  {import.meta.env.VITE_API_BASE_URL || ''}
                </code>
              </div>
              <div>
                <span className="font-medium">Database:</span>
                <code className="ml-2 px-2 py-1 bg-muted rounded">Redis 7.2+</code>
              </div>
            </div>
            <div className="pt-4">
              <span className="font-medium">Available Endpoints:</span>
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                <li><code>POST /api/notes</code> - Create note</li>
                <li><code>GET /api/notes/:id</code> - Get note</li>
                <li><code>PUT /api/notes/:id</code> - Update note</li>
                <li><code>DELETE /api/notes/:id</code> - Delete note</li>
                <li><code>GET /api/stacks/:stackId/notes</code> - Get stack notes</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Stack Selector */}
        <Card>
          <CardHeader>
            <CardTitle>Select Stack</CardTitle>
            <CardDescription>
              Choose which stack to view and manage notes for
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                value={stackId}
                onChange={(e) => setStackId(e.target.value)}
                placeholder="Enter stack ID"
              />
              <Button variant="outline" onClick={() => setStackId("stack-1")}>
                Stack 1
              </Button>
              <Button variant="outline" onClick={() => setStackId("stack-2")}>
                Stack 2
              </Button>
              <Button variant="outline" onClick={() => setStackId("stack-3")}>
                Stack 3
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Note Manager */}
        <NoteManager stackId={stackId} />

        {/* Documentation Card */}
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle>Documentation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Backend Setup:</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                <li>Navigate to <code className="px-1 py-0.5 bg-muted rounded">back/</code> directory</li>
                <li>Run <code className="px-1 py-0.5 bg-muted rounded">docker-compose up -d</code></li>
                <li>Backend will be available at <code className="px-1 py-0.5 bg-muted rounded">http://localhost:8080</code></li>
              </ol>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Files Reference:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li><code className="px-1 py-0.5 bg-muted rounded">back/BLUEPRINT.md</code> - Complete architecture guide</li>
                <li><code className="px-1 py-0.5 bg-muted rounded">back/README.md</code> - Quick start guide</li>
                <li><code className="px-1 py-0.5 bg-muted rounded">front/src/lib/api.ts</code> - API client functions</li>
                <li><code className="px-1 py-0.5 bg-muted rounded">front/src/hooks/useNotes.ts</code> - React Query hooks</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BackendDemo;

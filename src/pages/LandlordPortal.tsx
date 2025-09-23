import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Chat } from "@/components/ui/chat";
import { AnimatedList } from "@/components/ui/animated-list";
import { ArrowLeft, Users, Clock, CheckCircle, AlertTriangle, FileText, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MaintenanceRequest {
  id: string;
  tenant: string;
  description: string;
  urgency: "low" | "medium" | "high" | "urgent";
  category: string;
  status: "open" | "in-progress" | "resolved";
  date: string;
}

interface WorkflowCard {
  id: string;
  title: string;
  description: string;
  type: "task" | "document" | "maintenance";
  priority: "low" | "medium" | "high";
  status?: "pending" | "in-progress" | "done";
}

const LandlordPortal = () => {
  const { toast } = useToast();
  const [selectedRequest, setSelectedRequest] = useState<MaintenanceRequest | null>(null);
  // DnD + status animation state for workflow
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const [animatingDone, setAnimatingDone] = useState<Record<string, boolean>>({});
  
  const [requests, setRequests] = useState<MaintenanceRequest[]>([
    {
      id: "REQ001",
      tenant: "Sarah Johnson",
      description: "Kitchen sink is leaking underneath. Water is pooling on the cabinet floor.",
      urgency: "high",
      category: "Plumbing",
      status: "in-progress",
      date: "2024-01-15"
    },
    {
      id: "REQ002",
      tenant: "Mike Chen",
      description: "Heating unit in bedroom making loud noises and not heating effectively.",
      urgency: "medium", 
      category: "HVAC",
      status: "open",
      date: "2024-01-12"
    },
    {
      id: "REQ003",
      tenant: "Emma Wilson",
      description: "Light fixture in bathroom is flickering intermittently.",
      urgency: "low",
      category: "Electrical",
      status: "resolved",
      date: "2024-01-08"
    },
    {
      id: "REQ004",
      tenant: "John Davis",
      description: "Water heater not producing hot water, tenants reporting cold showers.",
      urgency: "urgent",
      category: "Plumbing",
      status: "open",
      date: "2024-01-16"
    }
  ]);

  const [workflowCards, setWorkflowCards] = useState<WorkflowCard[]>([
    {
      id: "WF001",
      title: "Schedule Plumber for Unit 2A", 
      description: "Kitchen sink repair - contact Mike's Plumbing",
      type: "task",
      priority: "high",
      status: "in-progress"
    },
    {
      id: "WF002",
      title: "Lease Contract - Sarah Johnson",
      description: "Generated lease renewal contract ready for review",
      type: "document", 
      priority: "medium",
      status: "pending"
    }
  ]);

  const handleMarkResolved = (requestId: string) => {
    toast({
      title: "Request Marked Resolved",
      description: "The maintenance request has been marked as completed.",
    });
  };

  const handleNotifyTenant = (tenant: string) => {
    toast({
      title: "Notification Sent",
      description: `Update sent to ${tenant}`,
    });
  };

  const handleGenerateContract = () => {
    const newCard: WorkflowCard = {
      id: `WF${Date.now()}`,
      title: "New Lease Contract Generated",
      description: "Standard lease agreement ready for download",
      type: "document",
      priority: "medium"
    };
    setWorkflowCards([...workflowCards, newCard]);
    toast({
      title: "Contract Generated",
      description: "New lease contract added to your workflow.",
    });
  };

  const removeWorkflowCard = (id: string) => {
    setWorkflowCards(cards => cards.filter(card => card.id !== id));
  };

  const markWorkflowDone = (id: string) => {
    setWorkflowCards(cards => cards.map(c => c.id === id ? { ...c, status: "done" } : c));
    setAnimatingDone(prev => ({ ...prev, [id]: true }));
    // Hide big checkmark after animation
    setTimeout(() => {
      setAnimatingDone(prev => ({ ...prev, [id]: false }));
    }, 1200);
  };

  // Drag & Drop handlers
  const handleDragStart = (index: number) => setDragIndex(index);
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setOverIndex(index);
  };
  const handleDrop = (index: number) => {
    if (dragIndex === null) return;
    if (dragIndex === index) {
      setDragIndex(null);
      setOverIndex(null);
      return;
    }
    setWorkflowCards(prev => {
      const next = [...prev];
      const [moved] = next.splice(dragIndex, 1);
      next.splice(index, 0, moved);
      return next;
    });
    setDragIndex(null);
    setOverIndex(null);
  };

  const handleRequestCreated = (request: MaintenanceRequest) => {
    setRequests(prev => [request, ...prev]);
    toast({
      title: "New Request Received",
      description: `Maintenance request from tenant: ${request.description.substring(0, 50)}...`,
    });
  };

  const stats = {
    totalOpen: requests.filter(r => r.status === "open").length,
    inProgress: requests.filter(r => r.status === "in-progress").length,
    avgResolution: "2.3 days"
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="bg-background/80 backdrop-blur-sm border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors">
              <ArrowLeft className="h-5 w-5" />
              Back to Portals
            </Link>
            <h1 className="text-xl font-semibold text-foreground">Landlord Portal</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Open Requests</p>
                  <p className="text-2xl font-bold text-foreground">{stats.totalOpen}</p>
                </div>
                <Clock className="h-8 w-8 text-warning" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                  <p className="text-2xl font-bold text-foreground">{stats.inProgress}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Resolution</p>
                  <p className="text-2xl font-bold text-foreground">{stats.avgResolution}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-success" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main two-column layout */}
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_420px]">
          {/* Left Column: Requests + Workflow + Quick Actions */}
          <div className="space-y-6 min-w-0">
            {/* Maintenance Requests Table */}
            <Card className="shadow-elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Maintenance Requests
                </CardTitle>
                <CardDescription>
                  Manage and track all tenant maintenance requests
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ticket ID</TableHead>
                      <TableHead>Tenant</TableHead>
                      <TableHead>Issue</TableHead>
                      <TableHead>Urgency</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {requests.map((request) => (
                      <TableRow 
                        key={request.id} 
                        className={request.urgency === "urgent" ? "bg-destructive/5 animate-pulse" : "hover:bg-muted/50 transition-colors"}
                      >
                        <TableCell className="font-medium">{request.id}</TableCell>
                        <TableCell>{request.tenant}</TableCell>
                        <TableCell className="max-w-xs truncate">{request.description}</TableCell>
                        <TableCell>
                          <Badge variant={request.urgency}>{request.urgency}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={request.status}>{request.status.replace("-", " ")}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => setSelectedRequest(request)}
                                >
                                  View
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>Request Details - {request.id}</DialogTitle>
                                  <DialogDescription>
                                    Maintenance request from {request.tenant}
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <h4 className="font-semibold mb-2">Description</h4>
                                    <p className="text-sm text-muted-foreground">{request.description}</p>
                                  </div>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <h4 className="font-semibold mb-2">Category</h4>
                                      <Badge variant="outline">{request.category}</Badge>
                                    </div>
                                    <div>
                                      <h4 className="font-semibold mb-2">Priority</h4>
                                      <Badge variant={request.urgency}>{request.urgency}</Badge>
                                    </div>
                                  </div>
                                  <div className="flex gap-2 pt-4">
                                    <Button 
                                      onClick={() => handleMarkResolved(request.id)}
                                      variant="success"
                                    >
                                      Mark Resolved
                                    </Button>
                                    <Button 
                                      onClick={() => handleNotifyTenant(request.tenant)}
                                      variant="outline"
                                    >
                                      Notify Tenant
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            {/* Workflow Section (scrollable if long) */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Workflow</CardTitle>
                <CardDescription>
                  Drag to reorder, click × to remove tasks
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="max-h-[calc(100vh-16rem)] overflow-y-auto pr-1">
                  <AnimatedList className="space-y-3">
                    {workflowCards.map((card, index) => (
                      <div
                        key={card.id}
                        draggable
                        onDragStart={() => handleDragStart(index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDrop={() => handleDrop(index)}
                        className={
                          "relative border rounded-lg p-4 space-y-2 cursor-move transition-all duration-200 " +
                          (overIndex === index ? "ring-2 ring-primary/50 scale-[1.01] " : "") +
                          (dragIndex === index ? "opacity-70 " : "hover:shadow-card hover:scale-[1.02]")
                        }
                      >
                        {/* Big animated check overlay */}
                        {animatingDone[card.id] && (
                          <div className="absolute inset-0 bg-background/60 backdrop-blur-[1px] rounded-lg flex items-center justify-center pointer-events-none">
                            <CheckCircle className="h-16 w-16 text-success animate-check-pop" />
                          </div>
                        )}

                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-sm">{card.title}</h4>
                            {card.status === "done" && (
                              <Badge variant="success" className="text-[10px]">Done</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            {card.status !== "done" && (
                              <Button
                                variant="success"
                                size="sm"
                                onClick={() => markWorkflowDone(card.id)}
                                className="h-6 px-2 text-xs"
                              >
                                Mark done
                              </Button>
                            )}
                            <Button 
                              variant="ghost" 
                              size="sm"
                              aria-label="Remove"
                              onClick={() => removeWorkflowCard(card.id)}
                              className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                            >
                              ×
                            </Button>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">{card.description}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant={card.priority} className="text-xs">
                            {card.priority}
                          </Badge>
                          <span className="text-xs text-muted-foreground">•</span>
                          <span className="text-xs text-muted-foreground capitalize">{card.type}</span>
                        </div>
                      </div>
                    ))}
                  </AnimatedList>

                  {workflowCards.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <p className="text-sm">No active workflow items</p>
                      <p className="text-xs">Tasks will appear here automatically</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={handleGenerateContract}
                  variant="hero" 
                  className="w-full justify-start"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Lease Contract
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Users className="h-4 w-4 mr-2" />
                  Manage Tenant Candidates
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Property
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Chat (sticky) */}
          <div className="min-w-0">
            <div className="lg:sticky lg:top-24">
              <Chat
                className="h-[calc(100vh-8rem)]"
                placeholder="Type 'generate lease contract' or manage requests..."
                onRequestCreated={handleRequestCreated}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandlordPortal;

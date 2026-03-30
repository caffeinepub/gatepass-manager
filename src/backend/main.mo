import AccessControl "./authorization/access-control";
import MixinAuthorization "./authorization/MixinAuthorization";
import Map "mo:core/Map";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";

actor {

  let authState = AccessControl.initState();

  include MixinAuthorization(authState);

  type PassStatus = {
    #Pending;
    #Approved;
    #Rejected;
    #Exited;
    #Returned;
  };

  type GatePass = {
    id : Nat;
    studentName : Text;
    studentId : Text;
    rollNumber : Text;
    department : Text;
    purpose : Text;
    destination : Text;
    expectedReturnTime : Text;
    note : Text;
    status : PassStatus;
    requestedAt : Int;
    approvedAt : ?Int;
    exitedAt : ?Int;
    returnedAt : ?Int;
    rejectionReason : ?Text;
    requester : Principal;
  };

  type LogEntry = {
    passId : Nat;
    studentName : Text;
    rollNumber : Text;
    action : Text;
    timestamp : Int;
  };

  type Stats = {
    total : Nat;
    pending : Nat;
    approved : Nat;
    rejected : Nat;
    exited : Nat;
    returned : Nat;
  };

  var nextId : Nat = 1;
  let passes = Map.empty<Nat, GatePass>();
  var logs : [LogEntry] = [];

  func requireAtLeastUser(caller : Principal) {
    if (not AccessControl.hasPermission(authState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
  };

  func requireAdmin(caller : Principal) {
    if (not AccessControl.isAdmin(authState, caller)) {
      Runtime.trap("Unauthorized: Admins only");
    };
  };

  public shared ({ caller }) func requestPass(
    studentName : Text,
    studentId : Text,
    rollNumber : Text,
    department : Text,
    purpose : Text,
    destination : Text,
    expectedReturnTime : Text,
    note : Text,
  ) : async Nat {
    requireAtLeastUser(caller);
    let id = nextId;
    nextId += 1;
    let pass : GatePass = {
      id;
      studentName;
      studentId;
      rollNumber;
      department;
      purpose;
      destination;
      expectedReturnTime;
      note;
      status = #Pending;
      requestedAt = Time.now();
      approvedAt = null;
      exitedAt = null;
      returnedAt = null;
      rejectionReason = null;
      requester = caller;
    };
    passes.add(id, pass);
    id;
  };

  public shared ({ caller }) func approvePass(id : Nat) : async () {
    requireAdmin(caller);
    switch (passes.get(id)) {
      case (null) { Runtime.trap("Pass not found") };
      case (?p) {
        passes.add(id, { p with status = #Approved; approvedAt = ?Time.now() });
      };
    };
  };

  public shared ({ caller }) func rejectPass(id : Nat, reason : Text) : async () {
    requireAdmin(caller);
    switch (passes.get(id)) {
      case (null) { Runtime.trap("Pass not found") };
      case (?p) {
        passes.add(id, { p with status = #Rejected; rejectionReason = ?reason });
      };
    };
  };

  public shared ({ caller }) func markExit(id : Nat) : async () {
    requireAtLeastUser(caller);
    switch (passes.get(id)) {
      case (null) { Runtime.trap("Pass not found") };
      case (?p) {
        let now = Time.now();
        passes.add(id, { p with status = #Exited; exitedAt = ?now });
        logs := logs.concat([{
          passId = id;
          studentName = p.studentName;
          rollNumber = p.rollNumber;
          action = "Exit";
          timestamp = now;
        }]);
      };
    };
  };

  public shared ({ caller }) func markReturn(id : Nat) : async () {
    requireAtLeastUser(caller);
    switch (passes.get(id)) {
      case (null) { Runtime.trap("Pass not found") };
      case (?p) {
        let now = Time.now();
        passes.add(id, { p with status = #Returned; returnedAt = ?now });
        logs := logs.concat([{
          passId = id;
          studentName = p.studentName;
          rollNumber = p.rollNumber;
          action = "Return";
          timestamp = now;
        }]);
      };
    };
  };

  public query ({ caller }) func getAllPasses() : async [GatePass] {
    requireAtLeastUser(caller);
    passes.values().toArray();
  };

  public query ({ caller }) func getMyPasses() : async [GatePass] {
    requireAtLeastUser(caller);
    passes.values().filter(func(p : GatePass) : Bool { p.requester == caller }).toArray();
  };

  public query ({ caller }) func getPassById(id : Nat) : async ?GatePass {
    requireAtLeastUser(caller);
    passes.get(id);
  };

  public query ({ caller }) func getLog() : async [LogEntry] {
    requireAtLeastUser(caller);
    logs;
  };

  public query ({ caller }) func getStats() : async Stats {
    requireAtLeastUser(caller);
    var total = 0;
    var pending = 0;
    var approved = 0;
    var rejected = 0;
    var exited = 0;
    var returned = 0;
    for (p in passes.values()) {
      total += 1;
      switch (p.status) {
        case (#Pending)  { pending  += 1 };
        case (#Approved) { approved += 1 };
        case (#Rejected) { rejected += 1 };
        case (#Exited)   { exited   += 1 };
        case (#Returned) { returned += 1 };
      };
    };
    { total; pending; approved; rejected; exited; returned };
  };

};

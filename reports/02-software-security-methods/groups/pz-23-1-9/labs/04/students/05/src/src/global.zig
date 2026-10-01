const std = @import("std");

pub var gpa: std.mem.Allocator = undefined;
pub var arena: std.mem.Allocator = undefined;
pub var io: std.Io = undefined;

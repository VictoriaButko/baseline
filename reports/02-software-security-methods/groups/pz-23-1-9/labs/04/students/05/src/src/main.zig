const std = @import("std");
const global = @import("global.zig");
const interactive = @import("interactive.zig");
const cli = @import("cli.zig");

pub fn main(init: std.process.Init) !u8 {
    global.io = init.io;
    global.gpa = init.gpa;
    global.arena = init.arena.allocator();

    defer @import("algorithms.zig").freeThings();

    if (init.minimal.args.vector.len > 1) { // This check is not cross-platform
        return try cli.main(init.minimal);
    } else {
        return try interactive.main(init.minimal);
    }
}

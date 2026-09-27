const std = @import("std");
const Io = std.Io;
const global = @import("global.zig");
const util = @import("util.zig");
pub const opts = @import("algorithms/options.zig");
pub const freq = @import("algorithms/freq_analysis.zig");

const crypt_algos = struct {
    pub const cesar                  = @import("algorithms/cesar.zig");
    pub const cesar_affine           = @import("algorithms/cesar_affine.zig");
    pub const cesar_keyword          = @import("algorithms/cesar_keyword.zig");
    pub const table_simple           = @import("algorithms/table_simple.zig");
    pub const table_keyword          = @import("algorithms/table_keyword.zig");
    pub const table_double_transpose = @import("algorithms/table_double_transpose.zig");
};

pub const OpType = enum{encrypt, decrypt};
pub const AlgoType = std.meta.DeclEnum(crypt_algos);

pub fn runCryptAlgoOnFiles(
    algo_type: AlgoType, op_type: OpType,
    key: []const u8, in: Io.File, out: Io.File
) (std.mem.Allocator.Error || Io.Writer.Error)!bool {
    var in_buf: [1024]u8 = undefined;
    var source = in.reader(global.io, &in_buf);

    var out_buf: [1024]u8 = undefined;
    var sink = out.writer(global.io, &out_buf);

    const succeed = try runCryptAlgo(algo_type, op_type, key, &source.interface, &sink.interface);
    if (succeed) try sink.interface.flush();
    return succeed;
}

var source_unicode_buf: std.ArrayList(u21) = .empty;
pub fn freeThings() void { source_unicode_buf.deinit(global.gpa); }

pub fn runCryptAlgo(
    algo_type: AlgoType, op_type: OpType,
    key: []const u8, source: *Io.Reader, sink: *Io.Writer
) (std.mem.Allocator.Error || Io.Writer.Error)!bool {

    // Convert to unicode
    source_unicode_buf.clearRetainingCapacity();
    while (true) {
        const cp = util.takeCp(source) catch break orelse break;
        try source_unicode_buf.append(global.gpa, cp);
    }

    return switch (algo_type) {
        inline else => |algo| switch(op_type) {
            inline else => |op| @field(@field(crypt_algos, @tagName(algo)), @tagName(op))
                (key, source_unicode_buf.items, sink),
        },
    };
}

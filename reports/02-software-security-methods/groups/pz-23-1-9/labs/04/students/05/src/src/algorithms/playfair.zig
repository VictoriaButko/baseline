//! https://en.wikipedia.org/wiki/Playfair_cipher
//! Encrypt to coordinates on 5x5 matrix.
//! Removes everything except text at encryption stage
const std = @import("std");
const Io = std.Io;
const opts = @import("options.zig");
const mutil = @import("matrix_cyphers_util.zig");

pub fn encrypt(key_str: []const u8, source: []const u21, sink: *Io.Writer) Io.Writer.Error!bool {
    const mat = getKey(key_str) orelse return false;

    std.debug.print("Bigrams: ", .{});
    var it: mutil.BigramIter = .init(source, true);
    while (it.next()) |bigram| {
        std.debug.print("{u}{u} ", .{bigram[0], bigram[1]});

        const y1, const x1 = mutil.matrixYX(&mat, bigram[0]) orelse unreachable; // Ensured in iterator
        const y2, const x2 = mutil.matrixYX(&mat, bigram[1]) orelse unreachable;
        std.debug.assert(y1 != y2 or x1 != x2);

        var crypted: [2]u21 = undefined;
        if (y1 == y2) { // Same row
            crypted[0] = mat[y1*5 + (x1+1) % 5];
            crypted[1] = mat[y2*5 + (x2+1) % 5];
        } else if (x1 == x2) { // Same column
            crypted[0] = mat[((y1+1)%5)*5 + x1];
            crypted[1] = mat[((y2+1)%5)*5 + x2];
        } else { // Rectangle
            crypted[0] = mat[y1*5 + x2];
            crypted[1] = mat[y2*5 + x1];
        }
        try sink.print("{u}{u}", .{crypted[0], crypted[1]});
    }
    std.debug.print("\n", .{});

    return true;
}

pub fn decrypt(key_str: []const u8, source: []const u21, sink: *Io.Writer) Io.Writer.Error!bool {
    var src = source;
    while (src[src.len - 1] == '\n' or src[src.len - 1] == ' ') src = src[0..src.len-1];
    if (src.len % 2 != 0) {
        std.debug.print("Text length is not even\n", .{});
        return false;
    }

    const mat = getKey(key_str) orelse return false;
    for (0..src.len/2) |i| {
        const ch1 = src[i*2];
        const ch2 = src[i*2+1];

        // Check for text to be really playfair encrypted
        const y1, const x1 = mutil.matrixYX(&mat, ch1) orelse {
            std.debug.print("Character {u} not in the table\n", .{ch1});
            return false;
        };
        const y2, const x2 = mutil.matrixYX(&mat, ch2) orelse {
            std.debug.print("Character {u} not in the table\n", .{ch2});
            return false;
        };
        if (y1 == y2 and x1 == x2) {
            std.debug.print("Pair consists of same characters\n", .{});
            return false;
        }

        var plain: [2]u21 = undefined;
        if (y1 == y2) { // Same row
            plain[0] = mat[y1*5 + @as(u16, @intCast(@mod(@as(i32, x1) - 1, 5)))];
            plain[1] = mat[y2*5 + @as(u16, @intCast(@mod(@as(i32, x2) - 1, 5)))];
        } else if (x1 == x2) { // Same column
            plain[0] = mat[@as(u16, @intCast(@mod(@as(i32, y1) - 1, 5)))*5 + x1];
            plain[1] = mat[@as(u16, @intCast(@mod(@as(i32, y2) - 1, 5)))*5 + x2];
        } else { // Rectangle
            plain[0] = mat[y1*5 + x2];
            plain[1] = mat[y2*5 + x1];
        }
        try sink.print("{u}{u}", .{plain[0], plain[1]});
    }
    return true;
}

pub fn getKey(key_str: []const u8) ?[25]u21 {
    const mat = mutil.makeMatrix(key_str) orelse return null;
    std.debug.print("Matrix:\n", .{});
    mutil.printMatrix(&mat);
    return mat;
}

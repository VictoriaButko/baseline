//! https://en.wikipedia.org/wiki/Two-square_cipher
//! Key format: <first_keyword>,<second_keyword>
const std = @import("std");
const Io = std.Io;
const opts = @import("options.zig");
const mutil = @import("matrix_cyphers_util.zig");

pub fn encrypt(key_str: []const u8, source: []const u21, sink: *Io.Writer) Io.Writer.Error!bool {
    const top, const bottom = getKey(key_str) orelse return false;

    std.debug.print("Bigrams: ", .{});
    var it: mutil.BigramIter = .init(source, false); // As of different squares there is no
                                                     // need to add 'x' between same letters
    while (it.next()) |bigram| {
        std.debug.print("{u}{u} ", .{bigram[0], bigram[1]});

        const y1, const x1 = mutil.matrixYX(&top, bigram[0]) orelse unreachable; // Ensured in iterator
        const y2, const x2 = mutil.matrixYX(&bottom, bigram[1]) orelse unreachable;

        var crypted: [2]u21 = undefined;
        if (x1 == x2) { // Same column
            crypted[0] = top[((y1+1)%5)*5 + x1];
            crypted[1] = bottom[((y2+1)%5)*5 + x2];
        } else { // Rectangle
            crypted[0] = top[y1*5 + x2];
            crypted[1] = bottom[y2*5 + x1];
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

    const top, const bottom = getKey(key_str) orelse return false;
    for (0..src.len/2) |i| {
        const ch1 = src[i*2];
        const ch2 = src[i*2+1];

        const y1, const x1 = mutil.matrixYX(&top, ch1) orelse {
            std.debug.print("Character {u} not in the table\n", .{ch1});
            return false;
        };
        const y2, const x2 = mutil.matrixYX(&bottom, ch2) orelse {
            std.debug.print("Character {u} not in the table\n", .{ch2});
            return false;
        };

        var plain: [2]u21 = undefined;
        if (x1 == x2) { // Same column
            plain[0] = top[@as(u16, @intCast(@mod(@as(i32, y1) - 1, 5)))*5 + x1];
            plain[1] = bottom[@as(u16, @intCast(@mod(@as(i32, y2) - 1, 5)))*5 + x2];
        } else { // Rectangle
            plain[0] = top[y1*5 + x2];
            plain[1] = bottom[y2*5 + x1];
        }
        try sink.print("{u}{u}", .{plain[0], plain[1]});
    }


    return true;
}

fn getKey(key_str: []const u8) ?struct{[25]u21, [25]u21} {
    const sep_i = std.mem.findScalar(u8, key_str, ',') orelse {
        std.debug.print("Key must be in format '<first_keyword>;<second_keyword>'\n", .{});
        return null;
    };

    const top_mat = mutil.makeMatrix(key_str[0..sep_i]) orelse return null;
    const bottom_mat = mutil.makeMatrix(key_str[sep_i+1..]) orelse return null;

    std.debug.print("Top matrix:\n", .{});
    mutil.printMatrix(&top_mat);

    std.debug.print("Bottom matrix:\n", .{});
    mutil.printMatrix(&bottom_mat);

    return .{top_mat, bottom_mat};
}

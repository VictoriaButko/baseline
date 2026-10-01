const std = @import("std");

/// Union representing type of command line parameter
pub const CliParam = union(enum) {
        arg: [:0]const u8,
        flag: u8,
        long_flag: []const u8,

        parametrized_flag: struct {
                flag: u8,
                param: []const u8,
        },
        parametrized_long_flag: struct {
                flag: []const u8,
                param: []const u8,
        },
};

pub const ParamIterator = struct {
        pub const Substitution = struct {
                from: []const u8,
                to: u8,
        };

        args_it: std.process.Args.Iterator,
        flags_ended: bool = false,
        aliases: std.StaticStringMap(u8),

        /// Aliases is a tuple of tuples in format .{"long_flag", 'f'}
        /// Given long flags (whether parametrized or not) will be
        /// replaced with corresponding short flag.
        pub fn init(args: std.process.Args, comptime aliases: anytype) ParamIterator {
                var it: ParamIterator = .{
                        .args_it = args.iterate(),
                        .aliases = .initComptime(aliases),
                };
                _ = it.args_it.skip(); // Skip executable name
                return it;
        }

        pub fn deinit(it: *ParamIterator) void {
                it.args_it.deinit();
        }

        pub fn next(it: *ParamIterator) ?CliParam {
                const arg = it.args_it.next() orelse return null;

                // Return argument itself if no '-' prefix or
                // flag sentinel reached. Allows '-' to be arg.
                if (it.flags_ended or !(arg[0] == '-' and arg.len > 1)) {
                        return CliParam{.arg = arg};
                }

                // Flag sentinel check
                if (arg.len == 2 and arg[0] == '-' and arg[1] == '-') {
                        it.flags_ended = true;
                        return it.next();
                }

                // Long flag: --flag
                if (arg[1] == '-') {

                        const eq_ind = std.mem.findScalar(u8, arg, '=');

                        if (eq_ind) |eq_i| {
                                const lflag = arg[2..eq_i];
                                const param = arg[eq_i+1..];

                                return if (it.aliases.get(lflag)) |sflag|
                                        CliParam{.parametrized_flag = .{
                                                .flag = sflag,
                                                .param = param,
                                        }}
                                else
                                        CliParam{.parametrized_long_flag = .{
                                                .flag = lflag,
                                                .param = param,
                                        }};
                        } else {
                                const lflag = arg[2..];

                                return if (it.aliases.get(lflag)) |sflag|
                                        CliParam{.flag = sflag}
                                else
                                        CliParam{.long_flag = lflag};
                        }

                // Short flag: -f
                } else {
                        if (arg.len > 2) {
                                const start: usize = if (arg[2] == '=') 3 else 2;
                                return CliParam{.parametrized_flag = .{
                                        .flag = arg[1],
                                        .param = arg[start..],
                                }};
                        } else {
                                return CliParam{.flag = arg[1]};
                        }
                }
        }
};

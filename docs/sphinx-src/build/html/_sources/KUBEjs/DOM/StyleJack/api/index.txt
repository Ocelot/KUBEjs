StyleJack
=========

.. js:class:: StyleJack(context)

   :param HTMLElement/String context:
        Either a HTMLElement or a string containing a style rule (ex. "div.class" or HTMLDivElement)
        StyleJack also supports @font-face rules and @keyframes.
        These return their own APIs instead of StyleJack API.

       :returns: :js:class:`StyleJackAPI` or :js:class:`StyleJackFontFaceAPI` or :js:class:`StyleJackCSSKeyFrameAPI`

StyleJack FontFace API
^^^^^^^^^^^^^^^^^^^^^^

.. js:class::StyleJackFontFaceAPI

    The FontFace API will always return the API. It's not designed to be used as a getter, only for creating
    font-face rules entirely in JavaScript.  The rule will get initialized into the Stylesheet once both Family and Src
    are set.  You do not have to call any method to "commit" the rule into the Stylesheet.

.. js:function:: StyleJackFontFaceAPI.Family(_family)

    :param String _family:
        The name of the font family that you're registering. This can be any string, and provides the name
        that you access your font-face with (in a font-family in CSS or Font().Family() in StyleJack)

    :returns: :js:class:`StyleJackFontFaceAPI`

.. js:function:: StyleJackFontFaceAPI.Src(_src)

    :param String _src:
        The src of your font. This can be pre-formatted as url('') or the straight string.
        It doesn't check for http, so data URIs work as well.

    :returns: :js:class:`StyleJackFontFaceAPI`

.. js:function:: StyleJackFontFaceAPI.Stretch(_stretch)

    :param String _stretch:
        The stretch value that your font-face implements.

        **Permissible Values**: "normal","condensed","ultra-condensed","extra-condensed","semi-condensed","expanded","ultra-expanded","extra-expanded","semi-expanded"
    :throws `console.log`: Logs a message if you try to set an invalid value

    :returns: :js:class:`StyleJackFontFaceAPI`

.. js:function:: StyleJackFontFaceAPI.Style(_style)

    :param String _style:
        The font style that this font-face implements.

        **Permissible Values**: "normal","italic","oblique"

    :throws `console.log`: Logs a message if you try to set an invalid value
    :returns: :js:class:`StyleJackFontFaceAPI`

.. js:function:: StyleJackFontFaceAPI.UnicodeRange(_unicodeRange)

    :param String _unicodeRange:
        The unicode range that you want to use from the font file.
        This allows you to only import specific characters from a font into this custom font-family

    :throws `console.log`: Logs a message if you try to set an invalid value

    :returns: :js:class:`StyleJackFontFaceAPI`

.. js:function:: StyleJackFontFaceAPI.Weight(_weight)

    :param String/Number _weight:
        The font-weight for this font-family. This allows you to actually define what the weight of this @font-face is

        **Permissible values**: "normal", "bold", "lighter", "bolder", 100, 200, 300, 400, 500, 600, 700, 800, 900

    :throws `console.log`: Logs a message if you try to set an invalid value

    :returns: :js:class:`StyleJackFontFaceAPI`



StyleJack CSSKeyFrame API
^^^^^^^^^^^^^^^^^^^^^^^^^

.. js:class::StyleJackCSSKeyFrameAPI

.. js:function:: StyleJackCSSKeyFrameAPI.Index(_index)

    This is for inserting a new Keyframe at the given index. This returns the Stylejack
    representing the given index. Indexes should be 0-100 as they're percentages along the animations duration.

    :param Number _index:
            The percentage (0-100) of the animation where you want
            to create a new keyframe

        :returns: :js:class:`StyleJackAPI`


.. js:function:: StyleJackCSSKeyFrameAPI.Delete()

    Deletes the Keyframe rule entirely.

    :returns: `Boolean` Represents success/failure of removing the given keyframe rule.

.. js:function:: StyleJackCSSKeyFrameAPI.Debug()

    :returns: `CSSKeyFramesRule` Returns the raw DOM CSSKeyFramesRule object for debugging

.. todo::

    StyleJack Method Implementation. These methods require implementation still.

        .. js:function:: StyleJackCSSKeyFrameAPI.Clear(_index)
        .. js:function:: StyleJackCSSKeyFrameAPI.Each()

        Event Methods as well do nothing (Events are never emitted)



StyleJack API
^^^^^^^^^^^^^

StyleJack API is simply a representation of the Object that you are returned after initializing
a new StyleJack with a Node/StyleRule

You cannot instantiate this manually, as it's the return value from StyleJack


StyleJack is a fairly fluid API. For most contexts, if you are setting a value, you will receive the relevant API back.
This means that if you're on the level 1 API (StyleJackAPI), you will receive the StyleJack API back to allow chaining.
If you are on a level 2 API (StyleJackBackgroundAPI), you will receive that API back. The property .api will allow you
to return to the level 1 API

    .. note::
        The `String` "$" Is a special value that you can pass into all of the StyleJackAPI methods to get the raw value back. Else, StyleJack will
        attempt to parse the value from px to a programatically usable value (eg: String("16px") => Number(16).
        If the value is in any other format (eg: em, pt, cm) it will be returned as a String.

        This is convenient in the cases where the Style returns a Level 2 API (ex: Background), as you can simply call::

            KUBE.Class('/Library/DOM/StyleJack')(document.body).Background('$');

        instead of::

            KUBE.Class('/Library/DOM/StyleJack')(document.body).Background().Get();

.. js:class:: StyleJackAPI


.. js:function:: StyleJackAPI.Delete()

        Deletes the current style rule from the stylesheet.

   :returns:  `void`

.. js:function:: StyleJackAPI.GetStyleObj()

        Returns the CSSStyleRule that this current StyleJack represents

   :returns:  :js:class:`CSSStyleRule`

.. js:function:: StyleJackAPI.Appearance([_value])

        Used for getting/setting the appearance property.

   :returns:  :js:class:`StyleJackAPI`

   .. todo::
        Appearance property has some flaws. It's prefixed everywhere, and the values are prefixed as well
        We might need to re-assess it and possibly remove it from StyleJack for the time being.

.. js:function:: StyleJackAPI.BackfaceVisibility([_value])

        :param String _value: If no value passed in, returns the current value. Else, attempts to set the value to the property

        Used for setting Backface Visibility

    :returns:  :js:class:`StyleJackAPI`

.. js:function:: StyleJackAPI.Background([_value])

        :param String _value: If no value passed in, returns `StyleJackBackgroundAPI`. Else, attempts to set the value to the property

   :returns: :js:class:`StyleJackBackgroundAPI`

.. js:function:: StyleJackAPI.Border()

   :returns:  :js:class:`StyleJackAPI`

.. js:function:: StyleJackAPI.Bottom()

   :returns:  :js:class:`StyleJackAPI`

.. js:function:: StyleJackAPI.Box()

   :returns:  :js:class:`StyleJackAPI`

.. js:function:: StyleJackAPI.CaptionSide()

   :returns:  :js:class:`StyleJackAPI`

.. js:function:: StyleJackAPI.Clip()

   :returns:  :js:class:`StyleJackAPI`

.. js:function:: StyleJackAPI.Color()

   :returns:  :js:class:`StyleJackAPI`

.. js:function:: StyleJackAPI.Content()

   :returns:  :js:class:`StyleJackAPI`

.. js:function:: StyleJackAPI.Cursor()

   :returns:  :js:class:`StyleJackAPI`

.. js:function:: StyleJackAPI.Direction()

   :returns:  :js:class:`StyleJackAPI`

.. js:function:: StyleJackAPI.Display()

   :returns:  :js:class:`StyleJackAPI`

.. js:function:: StyleJackAPI.EmptyCells()

   :returns:  :js:class:`StyleJackAPI`

.. js:function:: StyleJackAPI.Float()

   :returns:  :js:class:`StyleJackAPI`

.. js:function:: StyleJackAPI.Font()

   :returns:  :js:class:`StyleJackAPI`

.. js:function:: StyleJackAPI.Height()

   :returns:  :js:class:`StyleJackAPI`

.. js:function:: StyleJackAPI.Left()

   :returns:  :js:class:`StyleJackAPI`

.. js:function:: StyleJackAPI.LetterSpacing()

   :returns:  :js:class:`StyleJackAPI`

.. js:function:: StyleJackAPI.LineHeight()

   :returns:  :js:class:`StyleJackAPI`

.. js:function:: StyleJackAPI.Margin()

   :returns:  :js:class:`StyleJackAPI`

.. js:function:: StyleJackAPI.MinHeight()

   :returns:  :js:class:`StyleJackAPI`

.. js:function:: StyleJackAPI.MinWidth()

   :returns:  :js:class:`StyleJackAPI`

.. js:function:: StyleJackAPI.MaxHeight()

   :returns:  :js:class:`StyleJackAPI`

.. js:function:: StyleJackAPI.MaxWidth()

   :returns:  :js:class:`StyleJackAPI`

.. js:function:: StyleJackAPI.Opacity()

   :returns:  :js:class:`StyleJackAPI`

.. js:function:: StyleJackAPI.Outline()

   :returns:  :js:class:`StyleJackAPI`

.. js:function:: StyleJackAPI.Overflow()

   :returns:  :js:class:`StyleJackAPI`

.. js:function:: StyleJackAPI.Padding()

   :returns:  :js:class:`StyleJackAPI`

.. js:function:: StyleJackAPI.Position()

   :returns:  :js:class:`StyleJackAPI`

.. js:function:: StyleJackAPI.Resize()

   :returns:  :js:class:`StyleJackAPI`

.. js:function:: StyleJackAPI.Right()

   :returns:  :js:class:`StyleJackAPI`

.. js:function:: StyleJackAPI.TableLayout()

   :returns:  :js:class:`StyleJackAPI`

.. js:function:: StyleJackAPI.Text()

   :returns:  :js:class:`StyleJackAPI`

.. js:function:: StyleJackAPI.Top()

   :returns:  :js:class:`StyleJackAPI`

.. js:function:: StyleJackAPI.Transform()

   :returns:  :js:class:`StyleJackAPI`

.. js:function:: StyleJackAPI.Transition()

   :returns:  :js:class:`StyleJackAPI`

.. js:function:: StyleJackAPI.VerticalAlign()

   :returns:  :js:class:`StyleJackAPI`

.. js:function:: StyleJackAPI.Visibility()

   :returns:  :js:class:`StyleJackAPI`

.. js:function:: StyleJackAPI.Width(width)

   :param mixed width: Width Value

        Used for

       :returns:  :js:class:`StyleJackAPI` Or Number

.. js:function:: StyleJackAPI.WhiteSpace()

   :returns:  :js:class:`StyleJackAPI`

.. js:function:: StyleJackAPI.WordSpacing()

   :returns:  :js:class:`StyleJackAPI`

.. js:function:: StyleJackAPI.WordBreak()

   :returns:  :js:class:`StyleJackAPI`

.. js:function:: StyleJackAPI.WordWrap()

   :returns:  :js:class:`StyleJackAPI`

.. js:function:: StyleJackAPI.ZIndex()

   :returns:  :js:class:`StyleJackAPI`

StyleJack Background API
^^^^^^^^^^^^^^^^^^^^^^^^

.. js:class:: StyleJackBackgroundAPI

.. js:function:: StyleJackBackgroundAPI.Set()

    :returns: Object

.. js:function:: StyleJackBackgroundAPI.Get()

    :returns: :js:class:`StyleJackBackgroundAPI`

.. js:function:: StyleJackBackgroundAPI.Color()

    :returns: :js:class:`StyleJackBackgroundAPI`

.. js:function:: StyleJackBackgroundAPI.Attachment()

    :returns: :js:class:`StyleJackBackgroundAPI`

.. js:function:: StyleJackBackgroundAPI.Image()

    :returns: :js:class:`StyleJackBackgroundAPI`

.. js:function:: StyleJackBackgroundAPI.Position()

    :returns: :js:class:`StyleJackBackgroundAPI`

.. js:function:: StyleJackBackgroundAPI.Repeat()

    :returns: :js:class:`StyleJackBackgroundAPI`

.. js:function:: StyleJackBackgroundAPI.Clip()

    :returns: :js:class:`StyleJackBackgroundAPI`

.. js:function:: StyleJackBackgroundAPI.Origin()

    :returns: :js:class:`StyleJackBackgroundAPI`

.. js:function:: StyleJackBackgroundAPI.Size()

    :returns: :js:class:`StyleJackBackgroundAPI`

.. js:attribute:: StyleJackBackgroundAPI.api

    :returns: :js:class:`StyleJackAPI`

